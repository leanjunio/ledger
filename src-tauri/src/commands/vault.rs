use serde::Serialize;
use std::path::Path;
use std::sync::Mutex;
use tauri::State;

#[derive(Default)]
pub struct VaultState {
    pub root_path: Option<String>,
    pub file_paths: Vec<String>,
}

#[derive(Serialize)]
pub struct OpenVaultResult {
    pub root_path: String,
    pub file_paths: Vec<String>,
}

/// Collects all .md file paths under dir (relative to root). Used by open_vault and tests.
pub fn collect_md_paths(dir: &Path, root: &Path, out: &mut Vec<String>) -> std::io::Result<()> {
    if !dir.is_dir() {
        return Ok(());
    }
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_md_paths(&path, root, out)?;
        } else if path.extension().map_or(false, |e| e == "md") {
            if let Ok(rel) = path.strip_prefix(root) {
                out.push(rel.to_string_lossy().into_owned());
            } else {
                out.push(path.to_string_lossy().into_owned());
            }
        }
    }
    Ok(())
}

/// Core vault-open logic (no state). Used by open_vault command and integration tests.
pub fn open_vault_impl(path: &str) -> Result<OpenVaultResult, String> {
    let root = Path::new(path);
    if !root.exists() {
        return Err(format!("Path does not exist: {}", path));
    }
    if !root.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }
    let root_path_canon = std::fs::canonicalize(root).map_err(|e| e.to_string())?;
    let root_path = root_path_canon.to_string_lossy().into_owned();

    let mut file_paths = Vec::new();
    collect_md_paths(Path::new(&root_path), Path::new(&root_path), &mut file_paths)
        .map_err(|e| e.to_string())?;

    file_paths.sort();

    Ok(OpenVaultResult {
        root_path,
        file_paths,
    })
}

#[tauri::command]
pub fn open_vault(path: String, state: State<'_, Mutex<VaultState>>) -> Result<OpenVaultResult, String> {
    let result = open_vault_impl(&path)?;
    {
        let mut s = state.lock().map_err(|e| e.to_string())?;
        s.root_path = Some(result.root_path.clone());
        s.file_paths = result.file_paths.clone();
    }
    Ok(result)
}
