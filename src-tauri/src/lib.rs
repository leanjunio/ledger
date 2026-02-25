#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod markdown;

use tracing_subscriber::{fmt, prelude::*, EnvFilter};

use commands::VaultState;
use std::sync::Mutex;

pub use commands::{create_file_impl, delete_file_impl, read_file_impl, write_file_impl, open_vault_impl};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(fmt::layer())
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(VaultState::default()))
        .invoke_handler(tauri::generate_handler![
            commands::vault::open_vault,
            commands::session::get_session,
            commands::session::save_session,
            commands::file::list_files,
            commands::file::read_file,
            commands::file::write_file,
            commands::file::create_file,
            commands::file::delete_file,
            commands::parse::parse_file,
            commands::query::query_by_tag,
            commands::search::search_full_text,
            commands::log::log_from_frontend,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
