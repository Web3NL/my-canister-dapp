pub fn only_controllers() -> Result<(), String> {
    if ic_cdk::api::is_controller(&ic_cdk::api::msg_caller()) {
        Ok(())
    } else {
        Err("Caller is not a controller".to_string())
    }
}
