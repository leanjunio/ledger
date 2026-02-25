use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::State;

use super::vault::VaultState;

fn vault_root(state: &Mutex<VaultState>) -> Result<PathBuf, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    s.root_path
        .as_ref()
        .map(PathBuf::from)
        .ok_or_else(|| "No vault open".to_string())
}

/// Resolve path relative to vault root; ensure it is under root (no escape).
fn resolve_under_vault(state: &Mutex<VaultState>, path: &str) -> Result<PathBuf, String> {
    if path.contains("..") {
        return Err("Path must not contain ..".to_string());
    }
    let root = vault_root(state)?;
    let root_canon = root.canonicalize().map_err(|e| e.to_string())?;
    let full = root.join(path);
    let full_canon = if full.exists() {
        let c = full.canonicalize().map_err(|e| e.to_string())?;
        if !c.starts_with(&root_canon) {
            return Err("Path is outside vault".to_string());
        }
        c
    } else {
        let parent = full.parent().unwrap_or(&full);
        if parent.exists() {
            let parent_canon = parent.canonicalize().map_err(|e| e.to_string())?;
            if !parent_canon.starts_with(&root_canon) {
                return Err("Path is outside vault".to_string());
            }
            parent_canon.join(full.file_name().unwrap_or_default())
        } else {
            full
        }
    };
    Ok(full_canon)
}

#[tauri::command]
pub fn list_files(state: State<'_, Mutex<VaultState>>) -> Result<Vec<String>, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    Ok(s.file_paths.clone())
}

/// Core read logic for testing without Tauri state.
pub fn read_file_impl(root_path: &str, path: &str) -> Result<String, String> {
    if path.contains("..") {
        return Err("Path must not contain ..".to_string());
    }
    let root = Path::new(root_path).canonicalize().map_err(|e| e.to_string())?;
    let full = root.join(path);
    if !full.exists() || !full.starts_with(&root) {
        return Err("Path outside vault or not found".to_string());
    }
    std::fs::read_to_string(&full).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_file(path: String, state: State<'_, Mutex<VaultState>>) -> Result<String, String> {
    let root = vault_root(&state)?;
    read_file_impl(root.to_str().unwrap(), &path)
}

/// Core write logic for testing.
pub fn write_file_impl(root_path: &str, path: &str, content: &str) -> Result<(), String> {
    if path.contains("..") {
        return Err("Path must not contain ..".to_string());
    }
    let root = Path::new(root_path).canonicalize().map_err(|e| e.to_string())?;
    let full = root.join(path);
    if full.exists() && !full.canonicalize().unwrap_or_default().starts_with(&root) {
        return Err("Path outside vault".to_string());
    }
    if let Some(p) = full.parent() {
        std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    std::fs::write(&full, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_file(
    path: String,
    content: String,
    state: State<'_, Mutex<VaultState>>,
) -> Result<(), String> {
    let root = vault_root(&state)?;
    write_file_impl(root.to_str().unwrap(), &path, &content)
}

/// Core create logic for testing.
pub fn create_file_impl(root_path: &str, path: &str) -> Result<(), String> {
    if path.contains("..") {
        return Err("Path must not contain ..".to_string());
    }
    let root = Path::new(root_path).canonicalize().map_err(|e| e.to_string())?;
    let full = root.join(path);
    if full.exists() {
        return Err("File already exists".to_string());
    }
    if let Some(p) = full.parent() {
        std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    std::fs::File::create(&full).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn create_file(path: String, state: State<'_, Mutex<VaultState>>) -> Result<(), String> {
    let root = vault_root(&state)?;
    create_file_impl(root.to_str().unwrap(), &path)?;
    let mut paths = state.lock().map_err(|e| e.to_string())?;
    if !paths.file_paths.contains(&path) {
        paths.file_paths.push(path);
        paths.file_paths.sort();
    }
    Ok(())
}

/// Core delete logic for testing.
pub fn delete_file_impl(root_path: &str, path: &str) -> Result<(), String> {
    if path.contains("..") {
        return Err("Path must not contain ..".to_string());
    }
    let root = Path::new(root_path).canonicalize().map_err(|e| e.to_string())?;
    let full = root.join(path);
    if !full.is_file() || !full.starts_with(&root) {
        return Err("Not a file or path outside vault".to_string());
    }
    std::fs::remove_file(&full).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_file(path: String, state: State<'_, Mutex<VaultState>>) -> Result<(), String> {
    let root = vault_root(&state)?;
    let full = resolve_under_vault(&state, &path)?;
    if !full.is_file() {
        return Err("Not a file or path outside vault".to_string());
    }
    std::fs::remove_file(&full).map_err(|e| e.to_string())?;
    let mut paths = state.lock().map_err(|e| e.to_string())?;
    let rel_str = full.strip_prefix(&root).map(|p| p.to_string_lossy().into_owned());
    if let Ok(rel) = rel_str {
        paths.file_paths.retain(|p| p != &rel);
    }
    Ok(())
}
