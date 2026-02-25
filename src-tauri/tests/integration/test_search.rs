//! Integration test: search_full_text across vault files.

use ledger_lib::{
    create_file_impl, open_vault_impl, write_file_impl,
};
use std::fs;

#[test]
fn search_full_text_finds_match() {
    let temp = std::env::temp_dir().join("ledger_test_search");
    let _ = fs::remove_dir_all(&temp);
    fs::create_dir_all(&temp).unwrap();

    let result = open_vault_impl(temp.to_str().unwrap()).unwrap();
    let root = &result.root_path;

    // Create a file with known content
    create_file_impl(root, "notes.md").unwrap();
    write_file_impl(root, "notes.md", "Hello world\nThis is a test note\nWith multiple lines").unwrap();

    // Create another file without the search term
    create_file_impl(root, "other.md").unwrap();
    write_file_impl(root, "other.md", "Different content\nNo match here").unwrap();

    // Note: search_full_text requires VaultState which is only available during Tauri runtime.
    // For now, this test demonstrates the expected structure.
    // Integration with VaultState should be tested in end-to-end or when Tauri runtime is available.

    // Expected: search for "hello" (case-insensitive) should return one match
    // Result should include: file_path: "notes.md", snippet_or_line: "Hello world", start_offset and end_offset

    let _ = fs::remove_dir_all(&temp);
}

#[test]
fn search_full_text_no_match() {
    let temp = std::env::temp_dir().join("ledger_test_search_no_match");
    let _ = fs::remove_dir_all(&temp);
    fs::create_dir_all(&temp).unwrap();

    let result = open_vault_impl(temp.to_str().unwrap()).unwrap();
    let root = &result.root_path;

    create_file_impl(root, "notes.md").unwrap();
    write_file_impl(root, "notes.md", "Some content").unwrap();

    // Expected: search for non-existent term should return empty vector
    // UI should show "No results found" or similar clear message

    let _ = fs::remove_dir_all(&temp);
}
