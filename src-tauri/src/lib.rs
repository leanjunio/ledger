mod commands;
mod path_utils;

use std::path::Path;
use tauri::Manager;

const ROOT_PATH_FILENAME: &str = "root_path.txt";

fn read_root_path_from_dir(app_data_dir: &Path) -> Option<String> {
    let path = app_data_dir.join(ROOT_PATH_FILENAME);
    let s = std::fs::read_to_string(&path).ok()?;
    let s = s.trim().to_string();
    if s.is_empty() {
        return None;
    }
    Some(s)
}

fn write_root_path_to_dir(app_data_dir: &Path, path: &str) -> Result<(), String> {
    std::fs::create_dir_all(app_data_dir).map_err(|e| e.to_string())?;
    let file_path = app_data_dir.join(ROOT_PATH_FILENAME);
    std::fs::write(&file_path, path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_saved_root(app: tauri::AppHandle) -> Option<String> {
    let dir = app.path().app_data_dir().ok()?;
    read_root_path_from_dir(&dir)
}

#[tauri::command]
fn set_saved_root(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    write_root_path_to_dir(&dir, &path)
}

/// Opens a native folder picker. Returns the selected path or None if cancelled.
#[tauri::command]
fn open_folder_dialog() -> Result<Option<String>, String> {
    let folder = rfd::FileDialog::new().pick_folder();
    Ok(folder.and_then(|p| p.to_str().map(String::from)))
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg(test)]
mod saved_root_tests {
    use super::*;

    #[test]
    fn saved_root_roundtrip() {
        let temp = std::env::temp_dir().join("markdown_app_saved_root_test");
        std::fs::create_dir_all(&temp).unwrap();
        let test_path = "/some/root/path";
        write_root_path_to_dir(&temp, test_path).unwrap();
        let read = read_root_path_from_dir(&temp).unwrap();
        assert_eq!(read, test_path);
        let _ = std::fs::remove_dir_all(&temp);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_saved_root,
            set_saved_root,
            open_folder_dialog,
            commands::list_directory_tree,
            commands::list_markdown_files,
            commands::read_file,
            commands::write_file,
            commands::create_file,
            commands::delete_file,
            commands::delete_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
