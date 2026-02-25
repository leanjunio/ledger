# Parser Bug Analysis: Nested List Items

**Issue**: `parse_list_items()` fails to create TreeNode for nested items  
**Location**: `src-tauri/src/markdown/mod.rs:29-90`  
**Failing Test**: `parse_two_root_one_child` (line 97)  
**Impact**: FR-003, US2.1–US2.4

---

## Problem Statement

For markdown input `"- a\n  - b"`:
- **Expected**: 2 TreeNode objects (parent "a" and child "b")
- **Actual**: 1 TreeNode object (only parent "a")
- **Missing**: Child node "b" is never instantiated

---

## Current Parser Logic

The parser (lines 29-90) uses pulldown-cmark events:

```rust
pub fn parse_list_items(content: &str) -> Vec<TreeNode> {
    let mut nodes: Vec<TreeNode> = Vec::new();
    let mut stack: Vec<usize> = Vec::new();      // parent chain by depth
    let mut list_depth: u32 = 0;                  // nesting level
    let mut current_text = String::new();
    
    let parser = Parser::new(content);
    
    for event in parser {
        match event {
            Event::Start(Tag::List(_)) => {
                list_depth = list_depth.saturating_add(1);
            }
            Event::End(Tag::List(_)) => {
                list_depth = list_depth.saturating_sub(1);
            }
            Event::Start(Tag::Item) => {
                current_text.clear();
            }
            Event::End(Tag::Item) => {
                let text = current_text.trim().to_string();
                if text.is_empty() {
                    continue;  // Skip empty items
                }
                let tags = extract_tags(&text);
                let depth = list_depth.saturating_sub(1);  // depth 0 = root
                
                // Adjust stack to match depth
                while stack.len() > depth as usize {
                    stack.pop();
                }
                
                let parent_id = stack.last().copied();
                let id = nodes.len();
                
                // Register this node as child if parent exists
                if let Some(&pid) = stack.last() {
                    if let Some(p) = nodes.get_mut(pid) {
                        p.children_ids.push(id);
                    }
                }
                
                // Push self to stack and create node
                stack.push(id);
                nodes.push(TreeNode {
                    id,
                    depth,
                    text,
                    tags,
                    parent_id,
                    children_ids: Vec::new(),
                });
                current_text.clear();
            }
            Event::Text(t) => {
                current_text.push_str(&t.to_string());
            }
            // ... (SoftBreak, HardBreak, etc.)
            _ => {}
        }
    }
    
    nodes
}
```

---

## Expected Event Sequence

For input `"- a\n  - b"`, pulldown-cmark should generate:

| Event | list_depth | stack | Action | Notes |
|-------|-----------|-------|--------|-------|
| `Start(List)` | 1 | [] | Increment depth | Outer list begins |
| `Start(Item)` | 1 | [] | Clear text | First item "a" begins |
| `Text("a")` | 1 | [] | Append to text | Text content "a" |
| `Start(List)` | 2 | [] | Increment depth | **Nested list begins** |
| `Start(Item)` | 2 | [] | Clear text | Second item "b" begins |
| `Text("b")` | 2 | [] | Append to text | Text content "b" |
| `End(Item)` | 2 | [0] | Create node for "b" | **MISSING in actual output** |
| `End(List)` | 1 | [0] | Decrement depth | Nested list ends |
| `End(Item)` | 1 | [0] | Create node for "a" | **This may happen before "b"'s End(Item)** |
| `End(List)` | 0 | [] | Decrement depth | Outer list ends |

---

## Key Hypothesis: Event Order Issue

**Potential Problem**: The `End(Item)` for "a" may occur **before** the `Start(List)` event for the nested list.

If event sequence is actually:
```
Start(List)           → list_depth = 1
Start(Item)           → clear text
Text("a")             → current_text = "a"
End(Item)             → CREATE NODE "a" (depth=0), push to stack
Start(List)           → list_depth = 2
Start(Item)           → clear text
Text("b")             → current_text = "b"
End(Item)             → CREATE NODE "b" (depth=1)
End(List)             → list_depth = 1
End(List)             → list_depth = 0
```

Then the logic should work. But actual output shows only 1 node, so either:

1. **Scenario A**: The `End(Item)` for "b" is never triggered
   - Cause: Parser doesn't recognize "b" as a complete item
   - Fix: Check pulldown-cmark parsing of indented items

2. **Scenario B**: The `End(Item)` for "b" is skipped by the `if text.is_empty() { continue }` check
   - Cause: Text is being cleared or not captured properly
   - Fix: Add logging to see what `current_text` contains

3. **Scenario C**: Stack management is corrupt after "a" is added
   - Cause: Incorrect adjustment of stack before creating "b"
   - Fix: Review stack.pop() logic in lines 55-57

4. **Scenario D**: Markdown parser is not generating nested list events as expected
   - Cause: pulldown-cmark version or config issue
   - Fix: Write debug test to see actual events

---

## Debug Test to Identify Root Cause

Add this test to understand the event sequence:

```rust
#[test]
fn debug_event_sequence() {
    let content = "- a\n  - b";
    let parser = Parser::new(content);
    
    println!("Events for input: {:?}", content);
    for (i, event) in parser.enumerate() {
        println!("{}: {:?}", i, event);
    }
}
```

**Expected output** should show nested `Start(List)` / `End(List)` and two `Start(Item)` / `End(Item)` pairs.

**If actual output differs**, that explains the bug.

---

## Stack Trace Through Parse Logic

For the expected event sequence, trace through stack state:

```
After Text("a"):
  current_text = "a"
  list_depth = 1
  stack = []

After End(Item):
  text = "a"
  depth = 1 - 1 = 0
  while stack.len() (0) > 0 as usize (0) → condition false, don't pop
  parent_id = stack.last() = None
  id = nodes.len() = 0
  stack.push(0) → stack = [0]
  nodes[0] = TreeNode { id: 0, depth: 0, text: "a", parent_id: None, ... }
  nodes = [TreeNode("a")]

After Start(List) (nested):
  list_depth = 2

After Text("b"):
  current_text = "b"
  list_depth = 2
  stack = [0]

After End(Item):
  text = "b"
  depth = 2 - 1 = 1
  while stack.len() (1) > 1 as usize → condition false, don't pop
  parent_id = stack.last() = Some(0)
  id = nodes.len() = 1
  stack.last() = Some(0) → nodes[0].children_ids.push(1)
  stack.push(1) → stack = [0, 1]
  nodes[1] = TreeNode { id: 1, depth: 1, text: "b", parent_id: Some(0), ... }
  nodes = [TreeNode("a"), TreeNode("b")]
```

**This trace shows the logic SHOULD work**, producing 2 nodes. So the bug must be:
1. Event sequence is different than expected, OR
2. Text is being lost/cleared, OR
3. Parser is not recognizing the nested item

---

## Recommended Fix Approach

1. **Write event debug test** (see above)
2. **Capture actual event stream** for input `"- a\n  - b"`
3. **Compare to expected** event sequence
4. **Identify divergence point** (where actual ≠ expected)
5. **Update parsing logic** or config based on finding

---

## Testing Plan After Fix

After the bug is fixed, add these tests to prevent regression:

```rust
#[test]
fn parse_three_level_nesting() {
    let content = "- a\n  - b\n    - c";
    let nodes = parse_list_items(content);
    assert_eq!(nodes.len(), 3);
    // Verify hierarchy: a (depth 0) → b (depth 1, parent a) → c (depth 2, parent b)
}

#[test]
fn parse_siblings_at_same_level() {
    let content = "- a\n  - b\n  - c";
    let nodes = parse_list_items(content);
    assert_eq!(nodes.len(), 3);
    // Verify: a (depth 0, children [1,2]), b (depth 1, parent a), c (depth 1, parent a)
}

#[test]
fn parse_mixed_nesting() {
    let content = "- a\n  - a1\n- b\n  - b1\n    - b1i";
    let nodes = parse_list_items(content);
    assert_eq!(nodes.len(), 5);
    // Verify complex hierarchy
}
```

---

## Resources

- **Parser Code**: `src-tauri/src/markdown/mod.rs:29-90`
- **Failing Test**: `src-tauri/src/markdown/mod.rs:97-109`
- **Markdown Crate**: `pulldown-cmark` (check Cargo.toml for version)
- **Documentation**: https://docs.rs/pulldown-cmark/

