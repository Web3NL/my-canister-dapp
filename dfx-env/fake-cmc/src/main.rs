use ic_cdk::{query, update};

use candid::candid_method;
use fake_cmc::{
    IcpXdrConversionRateResponse, NotifyCreateCanisterArg, NotifyCreateCanisterResult,
    NotifyTopUpArg, NotifyTopUpResult,
};

fn main() {}

#[candid_method]
#[query]
fn get_icp_xdr_conversion_rate() -> IcpXdrConversionRateResponse {
    unimplemented!()
}

#[candid_method]
#[update]
fn notify_create_canister(_arg: NotifyCreateCanisterArg) -> NotifyCreateCanisterResult {
    unimplemented!()
}

#[candid_method]
#[update]
fn notify_top_up(_arg: NotifyTopUpArg) -> NotifyTopUpResult {
    unimplemented!()
}

#[test]
fn test_candid_interface_compatibility() {
    use candid_parser::utils::{CandidSource, service_equal};
    use std::path::PathBuf;

    candid::export_service!();
    let exported_interface = __export_service();

    let expected_interface =
        PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap()).join("fake-cmc.did");

    println!(
        "Expected interface: {}\n\n",
        CandidSource::File(expected_interface.as_path())
            .load()
            .unwrap()
            .1
            .unwrap()
    );
    println!("Exported interface: {exported_interface}\n\n");

    service_equal(
        CandidSource::Text(&exported_interface),
        CandidSource::File(expected_interface.as_path()),
    )
    .expect("The fake-cmc interface is not compatible with the fake-cmc.did file");
}
