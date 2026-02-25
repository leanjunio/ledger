# ADR-0005: Markdown List Parsing with Pulldown-Cmark and Inline Tags

## Status

Accepted

## Context

The app's core feature is interpreting markdown list structures as hierarchies and extracting tags from list items. The specification defines lists as lines starting with `-` or `*`, with indentation to show nesting. Tags are inline in list item text as `#word` (e.g., `#decision`, `#ci`). The app must parse these reliably so that queries and outline views reflect the true structure of the user's notes.

## Decision

We use the **pulldown-cmark** crate (version 0.9 or later) to parse markdown. Pulldown-cmark emits events as it walks the AST: `Start(Tag::List)`, `Start(Tag::Item)`, `Text(...)`, `End(Tag::Item)`, `End(Tag::List)`. The parser in `src-tauri/src/markdown/mod.rs` walks these events to build a tree:

1. **Depth tracking:** Each `Start(Tag::List)` increments list depth; each `End(Tag::List)` decrements it. The depth at `Start(Tag::Item)` defines that item's nesting level (0 for root, 1 for children, etc.).
2. **Text accumulation:** As events are processed, text is accumulated from `Text`, `SoftBreak`, and `HardBreak` events. When `End(Tag::Item)` fires, the accumulated text is finalized.
3. **Tag extraction:** Tags are extracted from the finalized item text using a regex `#([\w-]+)`. Tag names are stored without the `#` prefix.
4. **Tree structure:** Each item (`TreeNode`) has an id (index in the vector), depth, text, tags array, parent_id (resolved from the stack of open items), and children_ids (populated as children are discovered).

Output is a `Vec<TreeNode>` where `id` is the index. The structure preserves the hierarchy: a child node's parent_id points to its parent's id, and the parent's children_ids includes the child's id.

## Consequences

- **Reliable parsing:** Pulldown-cmark is a standard, well-maintained markdown parser. Using it avoids brittle regex-only approaches and handles edge cases (soft breaks, hard breaks, mixed content) correctly.
- **List-only modeling:** Only list structure is extracted. Non-list markdown (headings, paragraphs, code blocks, etc.) is ignored for the tree; it remains in the file but is not parsed into the model. This keeps the model simple and allows users to mix free-form and list content in the same file.
- **Tag format fixed:** Tags must match the regex `#([\w-]+)`. This means tag names consist of word characters (letters, digits, underscores) and hyphens. Tags are case-sensitive and must start with `#`. Variations (e.g., `#tag-with-dash`, `#tag_with_underscore`, `#tag123`) all work.
- **Parse on demand:** Every parse operation rebuilds the tree from the text. There is no persistent index of trees or tags. For large files, this is fast enough; for very large vaults (1000+ files), parse time grows linearly.
- **No cross-file references:** Each file is parsed independently. Tags are local to a file; there is no way to link items across files in the tag model (though the app's query feature can search multiple files).

## References

- `src-tauri/src/markdown/mod.rs` (parser implementation with tests)
- `src-tauri/Cargo.toml` (pulldown-cmark 0.9)
- `specs/001-developer-ledger/research.md` (markdown parsing choice and rationale)
- `specs/001-developer-ledger/data-model.md` (tree node and tag definitions)
