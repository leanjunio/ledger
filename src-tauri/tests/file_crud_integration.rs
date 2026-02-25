//! Integration test: create_file, read_file, write_file, delete_file.

use ledger_lib::{
    create_file_impl, delete_file_impl, open_vault_impl, read_file_impl, write_file_impl,
};
use std::fs;

#[test]
fn file_crud_create_read_write_delete() {
    let temp = std::env::temp_dir().join("ledger_test_crud");
    let _ = fs::remove_dir_all(&temp);
    fs::create_dir_all(&temp).unwrap();

    let result = open_vault_impl(temp.to_str().unwrap()).unwrap();
    let root = &result.root_path;

    create_file_impl(root, "t.md").unwrap();
    let content = read_file_impl(root, "t.md").unwrap();
    assert_eq!(content, "");

    write_file_impl(root, "t.md", "hi").unwrap();
    let content = read_file_impl(root, "t.md").unwrap();
    assert_eq!(content, "hi");

    delete_file_impl(root, "t.md").unwrap();
    let err = read_file_impl(root, "t.md").unwrap_err();
    assert!(!err.is_empty());

    let _ = fs::remove_dir_all(&temp);
}
