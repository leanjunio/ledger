use tracing::{event, Level};

#[tauri::command]
pub fn log_from_frontend(
    level: String,
    message: String,
    _payload: Option<serde_json::Value>,
) {
    let level = level.to_lowercase();
    match level.as_str() {
        "error" => event!(Level::ERROR, "{}", message),
        "warn" | "warning" => event!(Level::WARN, "{}", message),
        "info" => event!(Level::INFO, "{}", message),
        "debug" => event!(Level::DEBUG, "{}", message),
        "trace" => event!(Level::TRACE, "{}", message),
        _ => event!(Level::INFO, "{}", message),
    }
}
