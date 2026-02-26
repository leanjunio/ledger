use std::ffi::OsStr;
use std::path::Path;

/// Returns true if `path` is under `root` (canonicalized). Rejects empty root or path.
pub fn path_under_root(path: &Path, root: &Path) -> bool {
    if path.as_os_str().is_empty() || root.as_os_str().is_empty() {
        return false;
    }
    let canonical_root = match std::fs::canonicalize(root) {
        Ok(p) => p,
        Err(_) => return false,
    };
    let canonical_path = match std::fs::canonicalize(path) {
        Ok(p) => p,
        Err(_) => return false,
    };
    canonical_path.starts_with(&canonical_root)
}

/// Returns true if path has .md extension (case-sensitive for simplicity).
pub fn is_markdown_file(path: &Path) -> bool {
    path.extension() == Some(OsStr::new("md"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn path_under_root_accepts_file_in_root() {
        let temp = std::env::temp_dir();
        let root = temp.join("path_utils_root");
        let path = root.join("foo.md");
        std::fs::create_dir_all(&root).unwrap();
        std::fs::write(&path, "").unwrap();
        assert!(path_under_root(&path, &root));
        let _ = std::fs::remove_file(&path);
        let _ = std::fs::remove_dir(&root);
    }

    #[test]
    fn path_under_root_accepts_file_in_subfolder() {
        let temp = std::env::temp_dir();
        let root = temp.join("path_utils_root2");
        let path = root.join("a/b/foo.md");
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(&path, "").unwrap();
        assert!(path_under_root(&path, &root));
        let _ = std::fs::remove_file(&path);
        let _ = std::fs::remove_dir_all(root.join("a"));
        let _ = std::fs::remove_dir(&root);
    }

    #[test]
    fn path_under_root_rejects_escape_with_dotdot() {
        let temp = std::env::temp_dir();
        let root = temp.join("path_utils_root3");
        std::fs::create_dir_all(&root).unwrap();
        let path = root.join("../path_utils_other/foo.md");
        assert!(!path_under_root(&path, &root));
        let _ = std::fs::remove_dir(&root);
    }

    #[test]
    fn path_under_root_rejects_completely_different_path() {
        let temp = std::env::temp_dir();
        let root = temp.join("path_utils_root4");
        std::fs::create_dir_all(&root).unwrap();
        let path = temp.join("other/foo.md");
        assert!(!path_under_root(&path, &root));
        let _ = std::fs::remove_dir(&root);
    }

    #[test]
    fn is_markdown_file_accepts_md() {
        assert!(is_markdown_file(Path::new("file.md")));
    }

    #[test]
    fn is_markdown_file_rejects_txt() {
        assert!(!is_markdown_file(Path::new("file.txt")));
    }
}
