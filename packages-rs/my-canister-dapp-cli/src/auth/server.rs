use anyhow::{Result, bail};
use std::time::{Duration, Instant};
use tiny_http::{Header, Method, Response, Server};

use crate::icp::IcpCli;

use super::page::generate_auth_page;

/// Result of a successful authentication flow.
pub struct AuthResult {
    /// The II-derived principal for the canister's origin.
    pub principal: String,
    /// The localhost origin that was added to alternative origins (for cleanup).
    pub cli_origin: String,
}

/// Authentication timeout.
const AUTH_TIMEOUT: Duration = Duration::from_secs(120);

/// Run the full browser-based II authentication flow:
///
/// 1. Start a local HTTP server on a random port
/// 2. Add the localhost origin to the canister's alternative origins
/// 3. Open the browser for II authentication
/// 4. Wait for the principal callback
/// 5. Return the derived principal
///
/// The caller is responsible for removing the alternative origin and
/// updating controllers after this function returns.
pub fn run_auth_flow(
    ii_provider: &str,
    canister_origin: &str,
    icp: &IcpCli,
    canister_name: &str,
) -> Result<AuthResult> {
    // Start server on random port
    let server = Server::http("127.0.0.1:0").map_err(|e| anyhow::anyhow!("{e}"))?;
    let addr = server.server_addr().to_ip().expect("bound to IP address");
    let port = addr.port();
    let cli_origin = format!("http://localhost:{port}");
    let callback_url = format!("{cli_origin}/callback");

    // Add our localhost origin to the canister's alternative origins
    let add_origin_arg = format!("(variant {{ Add = \"{cli_origin}\" }})");
    icp.canister_call(canister_name, "manage_alternative_origins", &add_origin_arg)?;

    // Generate the auth page
    let html = generate_auth_page(ii_provider, canister_origin, &callback_url);

    // Open browser
    println!("Opening browser for authentication...");
    println!("  If the browser doesn't open, visit: {cli_origin}");
    if let Err(e) = open::that(&cli_origin) {
        eprintln!("Warning: Could not open browser automatically: {e}");
        eprintln!("Please open {cli_origin} manually.");
    }

    serve_auth_requests(server, &html, cli_origin, AUTH_TIMEOUT)
}

/// Validate the principal received from the callback POST body.
///
/// Returns the trimmed principal string, or an error if the body is empty
/// or indicates a client-side authentication error.
fn validate_callback_body(body: &str) -> Result<String> {
    let principal = body.trim().to_string();
    if principal.is_empty() {
        bail!("Authentication failed: received empty principal");
    }
    if principal.starts_with("ERROR:") {
        bail!("Authentication failed: {principal}");
    }
    Ok(principal)
}

/// Serve HTTP requests on the auth server until a valid callback is received or timeout.
///
/// Handles:
/// - `GET /` — serves the auth HTML page
/// - `POST /callback` — receives the derived principal
/// - `OPTIONS /callback` — CORS preflight
/// - everything else — 404
fn serve_auth_requests(
    server: Server,
    html: &str,
    cli_origin: String,
    timeout: Duration,
) -> Result<AuthResult> {
    let deadline = Instant::now() + timeout;

    loop {
        if Instant::now() > deadline {
            bail!(
                "Authentication timed out after {}s.\n\
                 Make sure you complete the Internet Identity login in the browser.",
                timeout.as_secs()
            );
        }

        let mut request = match server.recv_timeout(Duration::from_secs(1)) {
            Ok(Some(req)) => req,
            Ok(None) => continue,
            Err(e) => {
                bail!("Auth server error: {e}");
            }
        };

        let url = request.url().to_string();
        let method = request.method().clone();

        match (method, url.as_str()) {
            (Method::Get, "/") => {
                let header =
                    Header::from_bytes("content-type", "text/html; charset=utf-8").unwrap();
                let response = Response::from_string(html).with_header(header);
                let _ = request.respond(response);
            }
            (Method::Post, "/callback") => {
                let mut body = String::new();
                request
                    .as_reader()
                    .read_to_string(&mut body)
                    .unwrap_or_default();

                // Respond to the browser
                let cors = Header::from_bytes("access-control-allow-origin", "*").unwrap();
                let response = Response::from_string("ok").with_header(cors);
                let _ = request.respond(response);

                let principal = validate_callback_body(&body)?;

                return Ok(AuthResult {
                    principal,
                    cli_origin,
                });
            }
            (Method::Options, "/callback") => {
                // Handle CORS preflight
                let headers = vec![
                    Header::from_bytes("access-control-allow-origin", "*").unwrap(),
                    Header::from_bytes("access-control-allow-methods", "POST, OPTIONS").unwrap(),
                    Header::from_bytes("access-control-allow-headers", "content-type").unwrap(),
                ];
                let mut response = Response::from_string("");
                for h in headers {
                    response.add_header(h);
                }
                let _ = request.respond(response);
            }
            _ => {
                let response = Response::from_string("not found").with_status_code(404);
                let _ = request.respond(response);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{BufRead, BufReader, Write as _};
    use std::net::TcpStream;

    // -- validate_callback_body tests --

    #[test]
    fn validate_valid_principal() {
        let result = validate_callback_body("2vxsx-fae");
        assert_eq!(result.unwrap(), "2vxsx-fae");
    }

    #[test]
    fn validate_principal_with_whitespace() {
        let result = validate_callback_body("  2vxsx-fae  \n");
        assert_eq!(result.unwrap(), "2vxsx-fae");
    }

    #[test]
    fn validate_empty_body() {
        assert!(validate_callback_body("").is_err());
    }

    #[test]
    fn validate_whitespace_only() {
        assert!(validate_callback_body("   \n  ").is_err());
    }

    #[test]
    fn validate_error_prefix() {
        let result = validate_callback_body("ERROR: user cancelled");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("user cancelled"));
    }

    // -- HTTP server integration tests --

    /// Helper: start a server in a background thread, return (port, join_handle).
    /// The server serves the given HTML and will stop after the first POST /callback.
    fn start_test_server(html: &str) -> (u16, std::thread::JoinHandle<Result<AuthResult>>) {
        let server = Server::http("127.0.0.1:0").unwrap();
        let addr = server.server_addr().to_ip().unwrap();
        let port = addr.port();
        let html = html.to_string();
        let cli_origin = format!("http://localhost:{port}");

        let handle = std::thread::spawn(move || {
            serve_auth_requests(server, &html, cli_origin, Duration::from_secs(10))
        });

        // Give the server a moment to start accepting connections
        std::thread::sleep(Duration::from_millis(50));

        (port, handle)
    }

    /// Send a raw HTTP request and read the full response (headers + body).
    fn http_request(port: u16, request: &str) -> String {
        let mut stream = TcpStream::connect(format!("127.0.0.1:{port}")).unwrap();
        stream
            .set_read_timeout(Some(Duration::from_secs(5)))
            .unwrap();
        stream.write_all(request.as_bytes()).unwrap();
        stream.flush().unwrap();

        let mut reader = BufReader::new(&stream);
        let mut headers = String::new();
        let mut content_length: usize = 0;

        // Read headers until blank line
        loop {
            let mut line = String::new();
            match reader.read_line(&mut line) {
                Ok(0) => break,
                Ok(_) => {
                    if line == "\r\n" {
                        headers.push_str(&line);
                        break;
                    }
                    // Parse content-length header
                    if let Some(val) = line.strip_prefix("Content-Length: ") {
                        content_length = val.trim().parse().unwrap_or(0);
                    }
                    // tiny_http uses lowercase
                    if let Some(val) = line.strip_prefix("content-length: ") {
                        content_length = val.trim().parse().unwrap_or(0);
                    }
                    headers.push_str(&line);
                }
                Err(_) => break,
            }
        }

        // Read body based on content-length
        let mut body = vec![0u8; content_length];
        if content_length > 0 {
            std::io::Read::read_exact(&mut reader, &mut body).unwrap_or(());
        }

        format!("{headers}{}", String::from_utf8_lossy(&body))
    }

    #[test]
    fn server_get_root_returns_html() {
        let test_html = "<html><body>test page</body></html>";
        let (port, handle) = start_test_server(test_html);

        let response = http_request(port, "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n");

        assert!(response.contains("200"), "expected 200 status");
        assert!(
            response.contains("text/html"),
            "expected text/html content type"
        );
        assert!(response.contains("test page"), "expected HTML body");

        // Send a callback to stop the server
        http_request(
            port,
            "POST /callback HTTP/1.1\r\nHost: localhost\r\nContent-Length: 9\r\n\r\n2vxsx-fae",
        );
        let result = handle.join().unwrap();
        assert!(result.is_ok());
    }

    #[test]
    fn server_post_callback_returns_principal() {
        let (port, handle) = start_test_server("<html></html>");

        let response = http_request(
            port,
            "POST /callback HTTP/1.1\r\nHost: localhost\r\nContent-Length: 9\r\n\r\n2vxsx-fae",
        );

        assert!(response.contains("200"), "expected 200 status");
        assert!(
            response.contains("access-control-allow-origin"),
            "expected CORS header"
        );

        let result = handle.join().unwrap().unwrap();
        assert_eq!(result.principal, "2vxsx-fae");
        assert!(result.cli_origin.starts_with("http://localhost:"));
    }

    #[test]
    fn server_options_callback_returns_cors() {
        let (port, handle) = start_test_server("<html></html>");

        let response = http_request(
            port,
            "OPTIONS /callback HTTP/1.1\r\nHost: localhost\r\n\r\n",
        );

        assert!(response.contains("200"), "expected 200 status");
        assert!(response.contains("access-control-allow-origin"));
        assert!(response.contains("access-control-allow-methods"));
        assert!(response.contains("access-control-allow-headers"));

        // Stop the server
        http_request(
            port,
            "POST /callback HTTP/1.1\r\nHost: localhost\r\nContent-Length: 9\r\n\r\n2vxsx-fae",
        );
        handle.join().unwrap().ok();
    }

    #[test]
    fn server_unknown_route_returns_404() {
        let (port, handle) = start_test_server("<html></html>");

        let response = http_request(port, "GET /unknown HTTP/1.1\r\nHost: localhost\r\n\r\n");

        assert!(response.contains("404"), "expected 404 status");

        // Stop the server
        http_request(
            port,
            "POST /callback HTTP/1.1\r\nHost: localhost\r\nContent-Length: 9\r\n\r\n2vxsx-fae",
        );
        handle.join().unwrap().ok();
    }
}
