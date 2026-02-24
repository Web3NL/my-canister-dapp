//! My Notepad - Personal Notes Dapp
//!
//! A CRUD-style User-Owned Dapp demonstrating on-chain note storage using:
//! - `my_canister_frontend` for certified asset serving
//! - `my_canister_dashboard` for management UI and endpoints

use std::cell::RefCell;

use candid::CandidType;
use ic_cdk::{init, query, update};
use ic_http_certification::{HttpRequest, HttpResponse};
use include_dir::{include_dir, Dir};
use my_canister_dashboard::{
    guards::{only_canister_controllers_guard, only_ii_principal_guard},
    setup::setup_dashboard_assets,
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, ManageIIPrincipalArg,
    ManageIIPrincipalResult, ManageTopUpRuleArg, ManageTopUpRuleResult, WasmStatus,
};
use my_canister_frontend::{asset_router::with_asset_router_mut, setup_frontend};
use serde::Deserialize;

/// Embedded frontend assets from the build output.
static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../my-notepad-frontend/dist");

/// Alternative origins allowed for Internet Identity derivation.
const ALTERNATIVE_ORIGINS: &[&str] = &["http://localhost:5174"];

// ============================================================================
// Data Types
// ============================================================================

#[derive(CandidType, Deserialize, Clone)]
struct Note {
    id: u32,
    title: String,
    content: String,
    created_at: u64,
}

#[derive(CandidType, Deserialize)]
enum AddNoteResult {
    Ok(Note),
    Err(String),
}

#[derive(CandidType, Deserialize)]
enum DeleteNoteResult {
    Ok,
    Err(String),
}

// ============================================================================
// State
// ============================================================================

thread_local! {
    static NOTES: RefCell<Vec<Note>> = RefCell::new(Vec::new());
    static NEXT_ID: RefCell<u32> = RefCell::new(0);
}

// ============================================================================
// Initialization
// ============================================================================

#[init]
fn init() {
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");

    with_asset_router_mut(|router| {
        let origins: Vec<String> = ALTERNATIVE_ORIGINS.iter().map(|s| s.to_string()).collect();
        setup_dashboard_assets(router, Some(origins)).expect("Failed to setup dashboard assets");
    });
}

// ============================================================================
// HTTP Asset Serving
// ============================================================================

#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    my_canister_frontend::http_request(request)
}

// ============================================================================
// WASM Metadata
// ============================================================================

#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "My Notepad".to_string(),
        version: 1,
        memo: Some("Personal notes on the Internet Computer".to_string()),
    }
}

// ============================================================================
// Dashboard Management Endpoints
// ============================================================================

#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
    with_asset_router_mut(|router| my_canister_dashboard::manage_alternative_origins(router, arg))
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    my_canister_dashboard::manage_top_up_rule(arg)
}

// ============================================================================
// Notepad Endpoints
// ============================================================================

/// Return all notes for the authenticated owner.
#[query(guard = "only_ii_principal_guard")]
fn get_notes() -> Vec<Note> {
    NOTES.with(|notes| notes.borrow().clone())
}

/// Add a new note. Returns the created note.
#[update(guard = "only_ii_principal_guard")]
fn add_note(title: String, content: String) -> AddNoteResult {
    let title = title.trim().to_string();
    if title.is_empty() {
        return AddNoteResult::Err("Title cannot be empty".to_string());
    }

    let id = NEXT_ID.with(|next| {
        let id = *next.borrow();
        *next.borrow_mut() = id + 1;
        id
    });

    let note = Note {
        id,
        title,
        content,
        created_at: ic_cdk::api::time() / 1_000_000_000, // Convert nanoseconds to seconds
    };

    NOTES.with(|notes| notes.borrow_mut().push(note.clone()));

    AddNoteResult::Ok(note)
}

/// Delete a note by ID.
#[update(guard = "only_ii_principal_guard")]
fn delete_note(id: u32) -> DeleteNoteResult {
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        let len_before = notes.len();
        notes.retain(|n| n.id != id);
        if notes.len() == len_before {
            DeleteNoteResult::Err(format!("Note with id {} not found", id))
        } else {
            DeleteNoteResult::Ok
        }
    })
}
