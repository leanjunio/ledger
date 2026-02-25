# User Story 2 Validation Handoff
## Status: BLOCKED - Requires Parser Fix

**Validation Date**: February 25, 2026  
**Validator**: Multi-subagent validation run  
**Branch**: 001-developer-ledger  
**Spec Reference**: Quickstart validation checklist, row 3 (List hierarchy)  

---

## Validation Outcome

| Scenario | Status | Blocker |
|----------|--------|---------|
| US2.1 | ❌ BLOCKED | Parser bug: E-US2-001 |
| US2.2 | ❌ BLOCKED | Parser bug: E-US2-001 |
| US2.3 | ❌ BLOCKED | Parser bug: E-US2-001 |
| US2.4 | ❌ BLOCKED | Parser bug: E-US2-001 |

---

## Critical Finding

**Parser Bug Confirmed**:
- **Unit Test**: `markdown::tests::parse_two_root_one_child`
- **File**: `src-tauri/src/markdown/mod.rs:97-109`
- **Status**: ❌ FAILED (expected 2 nodes, got 1)
- **Evidence**: `cargo test parse_two_root_one_child` shows:
  ```
  assertion `left == right` failed: expected 2 nodes
    left: 1
    right: 2
  ```

**What This Means**:
- Input: `"- a\n  - b"` (parent item + indented child)
- Expected: 2 TreeNode objects (one for "a", one for "b")
- Actual: 1 TreeNode object (only "a", "b" is missing)
- Impact: **All nested list functionality broken**

---

## What Was Tested

✅ **Parser Unit Tests**:
- Ran all markdown module tests: `cargo test markdown::`
- Test 1 (parse_two_root_one_child): **FAILED** ❌
- Test 2 (parse_tags_decision_ci): **PASSED** ✅
- Confirmed: Nesting is broken; single items + tags work

❌ **UI Scenarios (Not Testable)**:
- US2.1–US2.4 require Tauri desktop app context
- App runs (`npm run tauri dev` verified), but Tauri invoke API not available in browser automation
- Would test: editor interactions, file save/load, outline panel display
- **Status**: Skipped due to Tauri environment limitation + parser bug

---

## What To Do Next

### Immediate (Before Re-validation)

1. **Fix the parser bug**
   - See `PARSER_BUG_ANALYSIS.md` for detailed investigation guide
   - Root cause: `parse_list_items()` not creating TreeNode for nested items
   - Likely causes:
     - Event sequence from pulldown-cmark different than expected
     - Text being lost during item creation
     - Stack management corrupted during nesting
   - Debugging approach: Add event trace test to see actual vs expected event sequence

2. **Expand parser tests** (once fixed)
   - Add test: `parse_three_level_nesting` (test "- a\n  - b\n    - c")
   - Add test: `parse_siblings_at_same_level` (test "- a\n  - b\n  - c")
   - Add test: `parse_mixed_nesting` (complex hierarchy)
   - Verify all tests pass

### After Parser Fix

1. **Re-run parser unit tests**
   ```bash
   cd src-tauri
   cargo test markdown:: -- --nocapture
   ```
   - Target: All tests PASS

2. **Validate US2.1–US2.4 in Tauri UI**
   - Steps (from quickstart.md row 3):
     1. Open app (already running)
     2. Create/open file: "hierarchy-test.md"
     3. Add line: `- Item A`
     4. Verify: "Item A" appears as root node in outline
     5. Add line: `  - Item B` (indented)
     6. Verify: "Item B" appears nested under "Item A"
     7. Save file
     8. Close and reopen file
     9. Verify: Structure still shows A as parent, B as child
   - Expected: All steps succeed
   - Report: Pass/Fail for each scenario

3. **Verify outline panel rendering**
   - Check: CSS `--depth` variable used correctly
   - Check: Indentation visually shows hierarchy
   - Check: Parent-child relationships clear

---

## Error Reference

### E-US2-001: Parser Returns Incomplete Node Set for Nested Items

**Identifier**: E-US2-001  
**Module**: `src-tauri/src/markdown/mod.rs::parse_list_items` (FR-003)  
**Severity**: CRITICAL (blocks all of FR-003 and US2)  

**How to Verify**:
```bash
cd /Users/lean/Documents/projects/ledger/src-tauri
cargo test parse_two_root_one_child -- --nocapture
```

**Expected vs Actual**:
- **Expected**: 2 TreeNode objects for input `"- a\n  - b"`
  - Node[0]: text="a", depth=0, parent_id=None, children_ids=[1]
  - Node[1]: text="b", depth=1, parent_id=Some(0), children_ids=[]
- **Actual**: 1 TreeNode object
  - Node[0]: text="a", depth=0, parent_id=None, children_ids=[]
  - (Node for "b" missing entirely)

**Related Files**:
- `src-tauri/src/markdown/mod.rs:29-90` (parse function)
- `src-tauri/src/markdown/mod.rs:97-109` (failing test)
- Quickstart row 3: List hierarchy scenario

---

## Documentation Provided

For the next validation pass (after fix), refer to:

1. **PARSER_BUG_ANALYSIS.md** — Technical deep-dive
   - Event sequence analysis
   - Stack trace through logic
   - Debug test recommendations
   - Testing plan for regression prevention

2. **US2_VALIDATION_SUMMARY.md** — High-level summary
   - Scenario results (all blocked)
   - Error list (E-US2-001)
   - Test evidence

3. **VALIDATION_US2_REPORT.md** — Complete validation report
   - Executive summary
   - Component analysis
   - Detailed checklist
   - Recommendations

4. **This document (US2_VALIDATION_HANDOFF.md)** — Handoff guide
   - What was tested
   - What to do next
   - How to re-validate

---

## Spec Traceability

| Spec Item | Status | Blocker | Note |
|-----------|--------|---------|------|
| FR-003: List hierarchy | ❌ BLOCKED | E-US2-001 | Parser unable to create nested nodes |
| US2.1: Root node | ❌ BLOCKED | E-US2-001 | Cannot test; parser broken |
| US2.2: Child nesting | ❌ BLOCKED | E-US2-001 | Parser doesn't create child nodes |
| US2.3: Multi-level hierarchy | ❌ BLOCKED | E-US2-001 | Parser fails on 2+ levels |
| US2.4: Hierarchy persistence | ❌ BLOCKED | E-US2-001 | Cannot save/restore broken structure |
| Quickstart row 3 | ❌ FAIL | E-US2-001 | List hierarchy validation fails |

---

## Summary for Next Validator

**Your mission**: Fix the parser bug and re-validate US2.

**Starting point**: `src-tauri/src/markdown/mod.rs::parse_list_items`

**Evidence of bug**: `cargo test parse_two_root_one_child` fails

**Re-validation checklist**:
- [ ] Parser fix implemented and tested
- [ ] `cargo test markdown::` shows all tests PASS
- [ ] New regression tests added (3-level, siblings, mixed)
- [ ] US2.1 scenario PASS in Tauri UI
- [ ] US2.2 scenario PASS in Tauri UI
- [ ] US2.3 scenario PASS in Tauri UI
- [ ] US2.4 scenario PASS in Tauri UI
- [ ] File save/restore cycle works
- [ ] Outline panel displays hierarchy correctly

**Success criteria**:
- All parser tests pass
- All US2 scenarios pass in UI
- Hierarchy persists across save/reload

---

## Technical Context

**Project**: Ledger MVP (Tauri v2, Rust + TypeScript)  
**Branch**: 001-developer-ledger  
**Tree structure**: Markdown list items → TreeNode objects → UI outline  

**Known working**:
- File CRUD (create, read, write, delete)
- Single list items (no nesting)
- Tag extraction from items

**Known broken**:
- Nested list items (parser returns incomplete node set)
- Hierarchy relationships (parent-child links broken)
- Multi-level nesting (only affects 2+ levels)

**Environment**:
- macOS darwin 25.2.0
- Rust 1.75+
- Tauri v2.0
- Node.js 18+
- pulldown-cmark (parser dependency)

