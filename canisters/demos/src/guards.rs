use crate::storage;

pub fn only_controllers() -> Result<(), String> {
    let caller = ic_cdk::api::msg_caller();
    if ic_cdk::api::is_controller(&caller) {
        return Ok(());
    }
    if storage::with_state(|s| s.admins.contains(&caller)) {
        return Ok(());
    }
    Err("Caller is not a controller or admin".to_string())
}
