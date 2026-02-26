use crate::path_utils;
use serde::Serialize;
use std::path::Path;

#[derive(Clone, Debug, Serialize)]
pub struct DirNode {
    pub name: String,
    pub path: String,
    pub children: Vec<DirNode>,
}

#[derive(Clone, Debug, Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
}

fn walk_dir(path: &Path) -> Result<Vec<DirNode>, String> {
    let mut nodes = Vec::new();
    for entry in std::fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let p = entry.path();
        if p.is_dir() {
            let name = p
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            let path_str = p.to_string_lossy().to_string();
            let children = walk_dir(&p)?;
            nodes.push(DirNode {
                name,
                path: path_str,
                children,
            });
        }
    }
    Ok(nodes)
}

/// Returns top-level directory nodes under root (directories only, no files).
#[tauri::command]
pub fn list_directory_tree(root: String) -> Result<Vec<DirNode>, String> {
    let path = Path::new(&root);
    if !path.is_dir() {
        return Err("root is not a directory".to_string());
    }
    walk_dir(path)
}

/// Returns markdown files in folder_path; folder_path must be under root.
#[tauri::command]
pub fn list_markdown_files(folder_path: String, root: String) -> Result<Vec<FileEntry>, String> {
    let root_p = Path::new(&root);
    let folder_p = Path::new(&folder_path);
    if !path_utils::path_under_root(folder_p, root_p) {
        return Err("folder path is not under root".to_string());
    }
    let mut entries = Vec::new();
    for entry in std::fs::read_dir(folder_p).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let p = entry.path();
        if p.is_file() && path_utils::is_markdown_file(&p) {
            let name = p
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            let path_str = p.to_string_lossy().to_string();
            entries.push(FileEntry { name, path: path_str });
        }
    }
    Ok(entries)
}

/// Reads a .md file under root. Returns error if path not under root or not .md.
#[tauri::command]
pub fn read_file(path: String, root: String) -> Result<String, String> {
    let root_p = Path::new(&root);
    let path_p = Path::new(&path);
    if !path_utils::path_under_root(path_p, root_p) {
        return Err("path is not under root".to_string());
    }
    if !path_utils::is_markdown_file(path_p) {
        return Err("path is not a markdown file".to_string());
    }
    std::fs::read_to_string(path_p).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn list_directory_tree_returns_dirs_only() {
        let temp = std::env::temp_dir().join("markdown_app_tree_test");
        let root = temp.join("root");
        std::fs::create_dir_all(root.join("a")).unwrap();
        std::fs::create_dir_all(root.join("b/c")).unwrap();
        std::fs::write(root.join("file.md"), "").unwrap();
        let result = list_directory_tree(root.to_string_lossy().to_string()).unwrap();
        let names: Vec<String> = result.iter().map(|n| n.name.clone()).collect();
        assert!(names.contains(&"a".to_string()));
        assert!(names.contains(&"b".to_string()));
        assert_eq!(names.len(), 2);
        let b = result.iter().find(|n| n.name == "b").unwrap();
        assert_eq!(b.children.len(), 1);
        assert_eq!(b.children[0].name, "c");
        let _ = std::fs::remove_dir_all(&temp);
    }

    #[test]
    fn list_markdown_files_filters_md_only() {
        let temp = std::env::temp_dir().join("markdown_app_list_md_test");
        let root = temp.join("root");
        std::fs::create_dir_all(&root).unwrap();
        std::fs::write(root.join("foo.md"), "").unwrap();
        std::fs::write(root.join("bar.md"), "").unwrap();
        std::fs::write(root.join("other.txt"), "").unwrap();
        let root_s = root.to_string_lossy().to_string();
        let result = list_markdown_files(root_s.clone(), root_s).unwrap();
        let names: Vec<String> = result.iter().map(|e| e.name.clone()).collect();
        assert!(names.contains(&"foo.md".to_string()));
        assert!(names.contains(&"bar.md".to_string()));
        assert!(!names.contains(&"other.txt".to_string()));
        assert_eq!(result.len(), 2);
        let _ = std::fs::remove_dir_all(&temp);
    }

    #[test]
    fn read_file_returns_content() {
        let temp = std::env::temp_dir().join("markdown_app_read_test");
        let root = temp.join("root");
        std::fs::create_dir_all(&root).unwrap();
        let note = root.join("note.md");
        std::fs::write(&note, "# Hello").unwrap();
        let root_s = root.to_string_lossy().to_string();
        let path_s = note.to_string_lossy().to_string();
        let content = read_file(path_s, root_s).unwrap();
        assert_eq!(content, "# Hello");
        let _ = std::fs::remove_dir_all(&temp);
    }

    #[test]
    fn read_file_rejects_path_outside_root() {
        let temp = std::env::temp_dir().join("markdown_app_read_reject_test");
        let root = temp.join("root");
        std::fs::create_dir_all(&root).unwrap();
        std::fs::write(root.join("note.md"), "x").unwrap();
        let other = std::env::temp_dir().join("other").join("note.md");
        std::fs::create_dir_all(other.parent().unwrap()).unwrap();
        std::fs::write(&other, "y").unwrap();
        let root_s = root.to_string_lossy().to_string();
        let path_s = other.to_string_lossy().to_string();
        let r = read_file(path_s, root_s);
        assert!(r.is_err());
        let _ = std::fs::remove_dir_all(&temp);
        let _ = std::fs::remove_dir_all(std::env::temp_dir().join("other"));
    }
}
