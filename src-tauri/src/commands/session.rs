use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const SESSION_FILENAME: &str = "config.json";

#[derive(Default, Serialize, Deserialize)]
pub struct SessionData {
    pub last_vault_path: Option<String>,
    pub last_file_path: Option<String>,
    pub theme: Option<String>,
}

fn session_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e: tauri::Error| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e: std::io::Error| e.to_string())?;
    Ok(dir.join(SESSION_FILENAME))
}

#[tauri::command]
pub fn get_session(app: AppHandle) -> Result<SessionData, String> {
    let path = session_path(&app)?;
    if !path.exists() {
        return Ok(SessionData::default());
    }
    let s = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&s).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_session(
    app: AppHandle,
    last_vault_path: Option<String>,
    last_file_path: Option<String>,
    theme: Option<String>,
) -> Result<(), String> {
    let path = session_path(&app)?;
    let mut current = if path.exists() {
        let s = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&s).unwrap_or_default()
    } else {
        SessionData::default()
    };
    if last_vault_path.is_some() {
        current.last_vault_path = last_vault_path;
    }
    if last_file_path.is_some() {
        current.last_file_path = last_file_path;
    }
    if theme.is_some() {
        current.theme = theme;
    }
    let s = serde_json::to_string_pretty(&current).map_err(|e| e.to_string())?;
    fs::write(&path, s).map_err(|e| e.to_string())
}
