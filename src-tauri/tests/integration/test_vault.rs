//! Integration test: open_vault on a temp dir with two .md files returns root_path and file_paths length 2.

use ledger_lib::open_vault_impl;
use std::fs;
use std::path::PathBuf;

#[test]
fn open_vault_returns_root_and_two_md_paths() {
    let temp = std::env::temp_dir().join("ledger_test_vault");
    let _ = fs::remove_dir_all(&temp);
    fs::create_dir_all(&temp).unwrap();
    fs::File::create(temp.join("a.md")).unwrap();
    fs::File::create(temp.join("b.md")).unwrap();

    let result = open_vault_impl(temp.to_str().unwrap()).unwrap();
    assert!(!result.root_path.is_empty());
    assert_eq!(result.file_paths.len(), 2, "expected 2 .md file paths");
    assert!(result.file_paths.contains(&"a.md".to_string()));
    assert!(result.file_paths.contains(&"b.md".to_string()));

    let _ = fs::remove_dir_all(&temp);
}
