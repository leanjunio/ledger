#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;

use commands::VaultState;
use std::sync::Mutex;

pub use commands::vault::open_vault_impl;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(VaultState::default()))
        .invoke_handler(tauri::generate_handler![
            commands::open_vault,
            commands::get_session,
            commands::save_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
