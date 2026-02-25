# User Story 2 Validation Report
## Hierarchical List Structure (US2.1–US2.4)

**Date**: February 25, 2026  
**Branch**: 001-developer-ledger  
**Environment**: Ledger MVP - Tauri desktop app  
**Executor Role**: Multi-subagent validation run

---

## Executive Summary

**Overall Status**: ❌ **BLOCKED - Critical Parser Bug**

User Story 2 cannot be validated in the UI because the underlying markdown list parser has a **critical bug** that prevents correct parsing of nested list items. The unit test `parse_two_root_one_child` fails, expecting 2 nodes but receiving only 1 for input `"- a\n  - b"`.

This parser bug blocks FR-003 (List hierarchy) and prevents all US2 scenarios from functioning correctly.

---

## Known Issue: Parser Failure

### Test Failure Details

**Test**: `markdown::tests::parse_two_root_one_child`  
**Location**: `src-tauri/src/markdown/mod.rs:97-109`  
**Status**: ❌ FAILED  

**Test Code**:
```rust
#[test]
fn parse_two_root_one_child() {
    // Nested list: first item contains a sublist
    let content = "- a\n  - b";
    let nodes = parse_list_items(content);
    assert_eq!(nodes.len(), 2, "expected 2 nodes");
    // ... assertions for hierarchy ...
}
```

**Expected Output**: 2 nodes (node for "a" at depth 0, node for "b" at depth 1 with parent_id=0)  
**Actual Output**: 1 node  

**Error Message**:
```
thread 'markdown::tests::parse_two_root_one_child' panicked at src/markdown/mod.rs:101:9:
assertion `left == right` failed: expected 2 nodes
  left: 1
  right: 2
```

---

## Scenario Validation Results

### US2.1: File open → add top-level list item → appears as root node
**Status**: ❌ **BLOCKED**  
**Reason**: Cannot test UI interactions due to Tauri app running in desktop environment (not accessible via browser automation). However, if the app were accessible, this scenario would fail because the parser only returns 1 node for nested content.

**Steps Attempted**:
1. App verified running via `npm run tauri dev` in terminal
2. Browser tab at http://localhost:5173/ exists
3. Console shows Tauri `invoke` API is undefined in browser context
4. Cannot complete UI interactions without proper Tauri desktop context

### US2.2: List item exists → add child (indented under it) → child nested, parent-child preserved
**Status**: ❌ **BLOCKED**  
**Reason**: Parser fails to create child nodes. The parser only returns 1 node total for input `"- a\n  - b"`, indicating the second item ("b") is never being instantiated as a TreeNode.

### US2.3: Multi-level hierarchy → view/edit → structure preserved, navigable
**Status**: ❌ **BLOCKED**  
**Reason**: Parser fails on 2-level nesting; deeper hierarchies will also fail.

### US2.4: Build hierarchy → save → hierarchy stored in markdown and restored on reopen
**Status**: ❌ **BLOCKED**  
**Reason**: Parser fails on first nesting level; cannot store or restore hierarchy correctly.

---

## Error Catalog

### E-US2-001: Parser Returns Incomplete Node Set for Nested Items

**Feature/Module**: `src-tauri/src/markdown/mod.rs::parse_list_items` (FR-003)

**How to Reproduce**:
```
1. Run: cd src-tauri && cargo test parse_two_root_one_child -- --nocapture
2. Observe: Test panics with "expected 2 nodes" but "left: 1"
```

**Expected vs Actual**:
- **Expected**: Parser creates 2 TreeNode objects:
  - Node 0: id=0, depth=0, text="a", parent_id=None, children_ids=[1]
  - Node 1: id=1, depth=1, text="b", parent_id=Some(0), children_ids=[]
- **Actual**: Parser creates 1 TreeNode object (only the root item "a", missing child "b")

**Root Cause Analysis**:
The parser logic in `parse_list_items` (lines 29-90) uses an event-based approach:
- Tracks `list_depth` for nesting level (starts at 0, increments on `Start(List)`, decrements on `End(List)`)
- When `End(Item)` occurs, calculates `depth = list_depth.saturating_sub(1)`
- Manages a stack to track parent-child relationships

**Hypothesis**: The second item ("b") may not be generating an `End(Item)` event before its parent list closes, or the event sequence is not what's expected by the parsing logic.

**Impact**: 
- US2.1, US2.2, US2.3, US2.4 all fail
- FR-003 (List hierarchy) non-functional
- Query scoping (US4.2) cannot work without hierarchy
- Tag queries on nested items cannot distinguish scope

**Environment**: 
- OS: macOS (darwin 25.2.0)
- Rust: cargo 1.75+ (via `rustup`)
- Tauri: v2.0
- Test suite: `cargo test parse_two_root_one_child`

**Related Test**: `parse_tags_decision_ci` (PASS) — Single items with tags parse correctly; the bug is specific to nesting.

---

## Component Analysis

### Parser (`src-tauri/src/markdown/mod.rs`)
**Status**: ❌ **BROKEN**  
- Unit test failure confirms bug
- Cannot parse 2+ item hierarchies
- Event sequence interpretation may be flawed

### Frontend UI Components
**Status**: ⚠️ **NOT TESTABLE**  
- Tauri app not accessible via browser automation in this environment
- Assuming parser were fixed, would need to verify:
  - File tree renders markdown files
  - Editor accepts list item syntax
  - Outline panel displays hierarchy with depth-based indentation (CSS `--depth` variable)
  - Parent-child relationships are visually represented

### File CRUD
**Status**: ⚠️ **PARTIAL**  
- File creation/reading/writing likely works (US1 scenarios)
- Hierarchy storage/restore depends on parser fix

---

## Validation Checklist (From quickstart.md, Row 3)

| Step | Action | Expected | Result | Notes |
|------|--------|----------|--------|-------|
| 3.1 | Open a file | File content displayed | ⚠️ Not tested | Blocked by Tauri context |
| 3.2 | Add line `- Item A` | Line appears in editor | ⚠️ Not tested | Blocked by Tauri context |
| 3.3 | Verify A as root node | A visible in tree/outline | ⚠️ Not tested | Blocked by Tauri context |
| 3.4 | Add line `  - Item B` | Line appears indented | ⚠️ Not tested | Blocked by Tauri context |
| 3.5 | Verify B nested under A | B shows as child of A | ❌ **Would fail** | Parser only returns 1 node for "- a\n  - b" |
| 3.6 | Save the file | File saved to disk | ⚠️ Not tested | Blocked by Tauri context |
| 3.7 | Reopen file | Hierarchy preserved | ❌ **Would fail** | Parser fails on nested content |

---

## Test Suite Status

| Test | Status | Notes |
|------|--------|-------|
| `markdown::tests::parse_two_root_one_child` | ❌ FAIL | Returns 1 node instead of 2 |
| `markdown::tests::parse_tags_decision_ci` | ✅ PASS | Single items with tags work |
| UI tests (US2.1–US2.4) | ⚠️ SKIPPED | Requires fixing parser first |

---

## Recommendations

### Immediate Actions Required

1. **Fix the parser bug** (Blocker)
   - Debug the `parse_list_items` function to understand why nested items don't create nodes
   - Likely issue: Event sequence handling for nested lists
   - Consider adding debug logging to trace event flow
   - Verify `pulldown-cmark` generates expected events

2. **Expand parser test coverage**
   - Add test for 3+ level nesting
   - Add test for sibling items at same level
   - Add test for mixed single/nested items

3. **UI testing** (After parser fix)
   - Run US2.1–US2.4 scenarios in Tauri desktop app
   - Verify outline panel displays hierarchy correctly
   - Test save/restore cycle

### Success Criteria (After Fix)

- [ ] `parse_two_root_one_child` test passes
- [ ] `parse_tags_decision_ci` test still passes
- [ ] All new parser tests pass
- [ ] US2.1–US2.4 scenarios pass in Tauri UI
- [ ] File save/reopen preserves hierarchy
- [ ] Outline panel shows depth-based indentation

---

## Conclusion

**User Story 2 cannot be validated** at this time due to a critical bug in the markdown list parser. The parser fails to correctly handle nested list items, returning incomplete node sets. This is a **blocking issue** that must be resolved before any US2 scenarios can be tested.

The bug is reproducible and well-defined (unit test failure in `parse_two_root_one_child`). Once fixed, all US2 scenarios should be re-tested to ensure correct functionality.

---

## Appendix: Test Execution Log

```
$ cd /Users/lean/Documents/projects/ledger/src-tauri
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

