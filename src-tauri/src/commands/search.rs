//! Full-text search across vault files. Performance: results capped at MAX_RESULTS (100)
//! so UI stays responsive; for 100+ files consider debouncing or background worker.

use serde::Serialize;
use std::path::Path;
use std::sync::{Mutex, PoisonError};
use tauri::State;

use super::vault::VaultState;

const MAX_RESULTS: usize = 100;

#[derive(Serialize)]
pub struct SearchMatch {
    pub file_path: String,
    #[serde(rename = "snippet_or_line")]
    pub snippet_or_line: String,
    pub start_offset: Option<usize>,
    pub end_offset: Option<usize>,
}

#[tauri::command]
pub fn search_full_text(
    query: String,
    paths: Option<Vec<String>>,
    fuzzy: Option<bool>,
    state: State<'_, Mutex<VaultState>>,
) -> Result<Vec<SearchMatch>, String> {
    let vault = state
        .lock()
        .map_err(|e: PoisonError<_>| e.to_string())?;
    let root_path = vault
        .root_path
        .as_ref()
        .ok_or("No vault open")?;
    let file_list: Vec<String> = paths.unwrap_or_else(|| vault.file_paths.clone());
    let root = Path::new(root_path);
    let _fuzzy = fuzzy.unwrap_or(false);
    let mut results = Vec::new();
    let query_lower = query.to_lowercase();

    for rel_path in file_list {
        if results.len() >= MAX_RESULTS {
            break;
        }
        let full = root.join(&rel_path);
        let content = match std::fs::read_to_string(&full) {
            Ok(c) => c,
            Err(_) => continue,
        };

        for line in content.lines() {
            let matched = line.to_lowercase().contains(&query_lower);
            if matched {
                let (start, end) = if !_fuzzy {
                    line.to_lowercase()
                        .find(&query_lower)
                        .map(|pos| (Some(pos), Some(pos + query.len())))
                        .unwrap_or((None, None))
                } else {
                    (None, None)
                };
                results.push(SearchMatch {
                    file_path: rel_path.clone(),
                    snippet_or_line: line.to_string(),
                    start_offset: start,
                    end_offset: end,
                });
                if results.len() >= MAX_RESULTS {
                    break;
                }
            }
        }
    }

    Ok(results)
}
