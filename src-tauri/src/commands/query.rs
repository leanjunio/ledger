use crate::markdown;
use serde::Serialize;
use std::collections::HashSet;
use std::path::Path;
use std::sync::{Mutex, PoisonError};
use tauri::State;

use super::vault::VaultState;

#[derive(Serialize)]
pub struct QueryResultItem {
    pub file_path: String,
    pub parent_path: Option<String>,
    pub node: markdown::TreeNode,
}

fn parent_path(nodes: &[markdown::TreeNode], node: &markdown::TreeNode) -> Option<String> {
    let mut path_parts: Vec<String> = Vec::new();
    let mut current_id = node.parent_id;
    while let Some(pid) = current_id {
        if let Some(p) = nodes.iter().find(|n| n.id == pid) {
            path_parts.insert(0, p.text.trim().to_string());
            current_id = p.parent_id;
        } else {
            break;
        }
    }
    if path_parts.is_empty() {
        None
    } else {
        Some(path_parts.join(" > "))
    }
}

fn is_descendant(nodes: &[markdown::TreeNode], node_id: usize, ancestor_id: usize) -> bool {
    let mut current_id = nodes.iter().find(|n| n.id == node_id).and_then(|n| n.parent_id);
    while let Some(pid) = current_id {
        if pid == ancestor_id {
            return true;
        }
        current_id = nodes.iter().find(|n| n.id == pid).and_then(|n| n.parent_id);
    }
    false
}

#[tauri::command]
pub fn query_by_tag(
    tag_names: Vec<String>,
    scope_node_id: Option<String>,
    paths: Option<Vec<String>>,
    state: State<'_, Mutex<VaultState>>,
) -> Result<Vec<QueryResultItem>, String> {
    let vault = state
        .lock()
        .map_err(|e: PoisonError<_>| e.to_string())?;
    let root_path = vault
        .root_path
        .as_ref()
        .ok_or("No vault open")?;
    let file_list: Vec<String> = paths
        .unwrap_or_else(|| vault.file_paths.clone());
    let root = Path::new(root_path);
    let scope_id: Option<usize> = scope_node_id.and_then(|s| s.parse().ok());

    let tag_set: HashSet<String> = tag_names.into_iter().collect();
    let mut results = Vec::new();

    for rel_path in file_list {
        let full = root.join(&rel_path);
        let content = match std::fs::read_to_string(&full) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let nodes = markdown::parse_list_items(&content);
        for node in &nodes {
            let has_tag = node.tags.iter().any(|t| tag_set.contains(t));
            if !has_tag {
                continue;
            }
            if let Some(sid) = scope_id {
                if node.id != sid && !is_descendant(&nodes, node.id, sid) {
                    continue;
                }
            }
            let parent_path_str = parent_path(&nodes, &node);
            results.push(QueryResultItem {
                file_path: rel_path.clone(),
                parent_path: parent_path_str,
                node: node.clone(),
            });
        }
    }

    Ok(results)
}
