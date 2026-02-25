use crate::markdown;
use serde::Serialize;

#[derive(Serialize)]
pub struct ParseFileResult {
    pub nodes: Vec<markdown::TreeNode>,
}

#[tauri::command]
pub fn parse_file(_path: String, content: String) -> ParseFileResult {
    let nodes = markdown::parse_list_items(&content);
    ParseFileResult { nodes }
}
