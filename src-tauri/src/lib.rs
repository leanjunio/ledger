#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod markdown;

use commands::VaultState;
use std::sync::Mutex;

pub use commands::file::{create_file_impl, delete_file_impl, read_file_impl, write_file_impl};
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
            commands::list_files,
            commands::read_file,
            commands::write_file,
            commands::create_file,
            commands::delete_file,
            commands::parse_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
