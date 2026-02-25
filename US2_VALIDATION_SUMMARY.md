# User Story 2 Validation Summary
## Hierarchical List Structure (US2.1–US2.4)

---

## Scenario Results

| Scenario | Status | Note |
|----------|--------|------|
| **US2.1** | ❌ BLOCKED | File open → add top-level list item → appears as root node. Cannot test due to parser bug blocking all hierarchy features. |
| **US2.2** | ❌ BLOCKED | List item exists → add child (indented) → child nested, parent-child preserved. Parser returns only 1 node for `"- a\n  - b"`, missing the nested child. |
| **US2.3** | ❌ BLOCKED | Multi-level hierarchy → view/edit → structure preserved, navigable. Parser fails at 2-level nesting; deeper hierarchies also blocked. |
| **US2.4** | ❌ BLOCKED | Build hierarchy → save → hierarchy stored and restored on reopen. Parser cannot correctly represent nested structure in file, so restore fails. |

---

## Error List

### E-US2-001: Parser Returns Incomplete Node Set for Nested Items

**Feature/Module**: `src-tauri/src/markdown/mod.rs::parse_list_items` (FR-003)

**How to Reproduce**:
```bash
cd /Users/lean/Documents/projects/ledger/src-tauri
cargo test parse_two_root_one_child -- --nocapture
```

**Expected vs Actual**:
```
Input: "- a\n  - b"

Expected (2 nodes):
  Node[0]: id=0, depth=0, text="a", parent_id=None, children_ids=[1]
  Node[1]: id=1, depth=1, text="b", parent_id=Some(0), children_ids=[]

Actual (1 node):
  Node[0]: id=0, depth=0, text="a", parent_id=None, children_ids=[]
  (Missing: Node for "b")
```

**Error Output**:
```
assertion `left == right` failed: expected 2 nodes
  left: 1
  right: 2
```

**Impact**: 
- Breaks FR-003 (List hierarchy) completely
- US2.1–US2.4 cannot function
- Query scoping (US4.2) broken
- Tag queries cannot filter by parent scope

**Root Cause**: The parser's event handler for nested lists is not correctly creating TreeNode objects for child items. The `End(Item)` event for the second item may not be firing, or the parsing state is being incorrectly managed during list nesting transitions.

---

## Summary

**Overall Status**: ❌ **BLOCKED BY CRITICAL PARSER BUG**

### What Works
- ✅ Single list items parse correctly
- ✅ Tags on single items extract correctly  
- ✅ File CRUD (create, read, write) likely functional (US1 scenarios)

### What's Broken
- ❌ Nested list items (parser returns incomplete node set)
- ❌ Parent-child hierarchy relationships
- ❌ Multi-level nesting
- ❌ Hierarchy persistence/restore

### Key Finding
The unit test `parse_two_root_one_child` **definitively proves** the parser has a bug:
- Input: `"- a\n  - b"` (one parent item, one child item)
- Expected: 2 nodes in output
- Actual: 1 node in output
- Difference: **Child item "b" is never created as a TreeNode**

### Next Steps
1. **Fix the parser** - Debug `parse_list_items()` to handle nested list events correctly
2. **Expand parser tests** - Add tests for 3+ levels, siblings, mixed nesting
3. **Re-validate US2** - After fix, run all four scenarios in the Tauri UI
4. **Verify persistence** - Save/reopen cycle must preserve hierarchy

---

## Test Evidence

```
$ cargo test markdown:: -- --nocapture

running 2 tests

thread 'markdown::tests::parse_two_root_one_child' panicked at src/markdown/mod.rs:101:9:
assertion `left == right` failed: expected 2 nodes
  left: 1
  right: 2

test markdown::tests::parse_two_root_one_child ... FAILED
test markdown::tests::parse_tags_decision_ci ... ok

test result: FAILED. 1 passed; 1 failed
```

This evidence shows:
1. Parser test suite runs (infrastructure OK)
2. Tag parsing works (single-item features OK)
3. Nesting is broken (the specific bug)

---

## Validation Environment
- **Branch**: 001-developer-ledger
- **App**: Ledger MVP (Tauri v2, Rust + TypeScript)
- **Test Framework**: cargo test (Rust unit tests)
- **OS**: macOS darwin 25.2.0
- **Date**: February 25, 2026

