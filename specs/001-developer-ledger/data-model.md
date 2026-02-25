# Data Model: Developer Ledger MVP

**Branch**: `001-developer-ledger` | **Date**: 2025-02-24  
**Executor**: Read [execution-principles.md](./execution-principles.md) first. This document defines every entity the app uses. Implementation must produce data that matches these shapes; validation steps tell you how to check that.

---

## Purpose

The data model defines **what** the application treats as "a file," "a list item," "a tag," "a query," and so on. It does **not** define how to store them in a database (we have no database; files are on disk, and list items/tags are derived from file content). The executor must implement code that creates and uses data matching these definitions so that the rest of the plan and the contracts stay consistent.

---

## Goals

- [ ] Every entity below has a clear definition and a list of attributes (fields) with types.
- [ ] Where data comes from (disk, memory, computed) is stated so the executor does not add a database or wrong storage.
- [ ] Validation section at the end tells the executor how to verify that the implementation matches the model (e.g. which tests to run or which spec FRs to check).

---

## Source of truth

- **Files**: Stored as real files on the user’s disk under the vault folder. Content is UTF-8 text (markdown).
- **List items, tags, query results**: Not stored separately. They are **computed** from file content when we parse or query. Do not create a separate table or index for "tags" or "list items" unless the plan and research are updated.
- **Session**: Stored in one JSON file in the app data directory (see research.md).

---

## 1. File

**What it is**: One markdown document in the vault. It corresponds to one file on disk (e.g. `notes/project-a.md`).

| Attribute | Type   | Description |
|-----------|--------|-------------|
| path      | string | Path to the file. Can be absolute or relative to the vault root. Must be under the vault root. |
| name      | string | Display name, e.g. the file name without folder (e.g. `project-a.md`). |
| content   | string | The raw text of the file (what you see when you open it in a text editor). UTF-8. |

**Relationships**: The content of a file, when parsed, produces zero or more **list items** (tree nodes). One file does not point to another file in the model.

**Lifecycle**: Created (new file on disk) → Open (loaded into editor) → Modified (user edited, not yet saved) → Saved (written back to disk) → Closed. Deleted = removed from disk and from the file tree.

**Validation**: When you implement "read file," the result must have path, name, and content. Path must be under the current vault root. Content must be a string (no binary). To verify: write a test that creates a file, reads it, and asserts that the returned object has these three fields and path is under vault root.

**Spec traceability**: FR-001 (create, open, read, edit, save, delete files), FR-007 (persist as markdown/text).

---

## 2. Tree node (list item)

**What it is**: One bullet line in a markdown list. Example: the line `- Build the feature #decision` is one list item. It has a depth (how many spaces or levels), the full text of the line (including tags), and a list of tag names extracted from that text.

| Attribute     | Type     | Description |
|---------------|----------|-------------|
| id            | string or number | A stable identifier for this node within one parse of one file. E.g. line index, or a generated id. Used to link parent/child. |
| depth         | integer  | Nesting level. 0 = top-level list item, 1 = one level of indentation, etc. |
| text          | string   | The full text of the list item line (including tags), e.g. `Build the feature #decision`. |
| tags          | array of strings | Tag names without the `#`. E.g. from `#decision` we store `"decision"`. From `#ci` we store `"ci"`. |
| parent_id     | string or number or null | The id of the list item that contains this one (the one with smaller depth). Null if this is a root item (depth 0). |
| children_ids  | array of ids | The ids of list items that are direct children of this node (one level deeper). |

**Relationships**: Parent/child form a tree. All nodes from one file belong to that file. Nodes are not stored on disk; they are produced by the parser when we read a file or run a query.

**Validation**: After parsing a file that contains two root items and one child under the first, the parser output must have exactly three nodes. The root nodes must have depth 0 and parent_id null. The child must have depth 1 and parent_id equal to the first root’s id. A line with `#decision` and `#ci` must produce a node whose tags array is `["decision", "ci"]`. Write a unit test that feeds a known markdown string and asserts on these fields.

**Spec traceability**: FR-003 (list structure as hierarchy), FR-004 (tags with list item).

---

## 3. Tag

**What it is**: A label like `#decision` or `#ci` that appears in the text of a list item. We store only the name part (e.g. `decision`) in the data model; the `#` is not stored.

| Attribute | Type   | Description |
|-----------|--------|-------------|
| name      | string | The tag name without `#`. E.g. `decision`, `ci`. Letters, numbers, hyphens only (per pattern in research). |

**Relationships**: Many list items can have the same tag name. There is no separate "tag" table or file; tags exist only inside the `tags` array of a tree node, which comes from parsing list item text.

**Validation**: When you extract tags from text, use the same pattern as in research.md (e.g. `#[\w-]+`). Names must not include the `#`. Case-sensitive unless the spec says otherwise (spec says exact match). Test: input `"Do it #decision"` → one tag with name `"decision"`.

**Spec traceability**: FR-004, FR-005 (query by tag).

---

## 4. Query

**What it is**: The user’s request: "Show me all list items that have tag X (and optionally only under node Y)." It is not stored; it is a set of parameters we pass to the query function.

| Attribute   | Type     | Description |
|-------------|----------|-------------|
| tag_names   | array of strings | At least one tag name. We return list items that have at least one of these tags. |
| scope       | id or null | Optional. If set, we only return items that are under this node (descendants in the tree). |

**Relationships**: Query runs over the set of all parsed list trees (from all files in the vault, or from the files in the `paths` argument if the command has one). It produces a list of **View** items (query results).

**Validation**: See contracts/tauri-commands.md for the command `query_by_tag(tag_names, scope_node_id?, paths?)`. The implementation must accept these arguments and return an array of QueryResultItem. Test: two files, each with one item tagged `#decision`; query with tag_names `["decision"]` must return two results.

**Spec traceability**: FR-005 (query by tag and scope), FR-006 (view with context and navigate).

---

## 5. View (query result item)

**What it is**: One row in the list of "query results." It tells the user which file and which list item matched, and gives enough context (e.g. parent path) to find it.

| Attribute    | Type   | Description |
|--------------|--------|-------------|
| file_path    | string | Path to the file that contains this list item. |
| parent_path  | string or null | Human-readable path from root to this item’s parent. E.g. `"Project A > Task 1"`. Optional if not implemented. |
| node         | Tree node | The list item (id, depth, text, tags, parent_id, children_ids). |

**Relationships**: Each View item is one matching list item from a Query. Used to display the results list and to "navigate to item" (open file_path and scroll/focus to that node).

**Validation**: After running query_by_tag, each element of the returned array must have file_path, node, and optionally parent_path. node must have the requested tag in its tags array. Test: same as for Query.

**Spec traceability**: FR-006.

---

## 6. Vault (workspace)

**What it is**: The folder the user chose. Not stored as an entity in a file; it is the root path we use for all file operations.

| Attribute   | Type     | Description |
|-------------|----------|-------------|
| root_path   | string   | Full path to the folder on disk. Must be an existing directory. |
| file_paths   | array of strings | Paths of all markdown files (e.g. `.md`) under root_path. Updated when we open the vault, create a file, or delete a file. |

**Validation**: When you implement open_vault, the return value must include root_path and file_paths. file_paths must only contain paths under root_path. Test: open_vault on a temp dir with two .md files returns two paths.

**Spec traceability**: Vault concept from spec (one folder, one workspace at a time).

---

## 7. Session state (persisted config)

**What it is**: Data we store so the app can reopen the last vault and file on next launch. Stored in one JSON file in the app data directory (see research.md).

| Attribute       | Type   | Description |
|-----------------|--------|-------------|
| last_vault_path | string or null | Last opened vault root path. |
| last_file_path  | string or null | Last opened file (full or relative path). |
| theme           | string or null | `"light"`, `"dark"`, or `"system"`. |

**Validation**: After saving session with last_vault_path and last_file_path, read the config file and assert the same values. After changing theme and saving, restart (or reload) and assert theme is applied.

**Spec traceability**: FR-011 (last opened file or empty screen), FR-012 (theme).

---

## Persistence summary (no guesswork)

| Concept     | Where it lives | Format |
|-------------|----------------|--------|
| Files       | User’s disk, under vault folder | Plain .md files, UTF-8 text |
| List items  | Not stored; computed when we parse a file | In-memory tree (from parser) |
| Tags        | Inside list item text in the file | Inline in markdown, e.g. `#decision` |
| Query / View| Not stored; computed when user runs a query | In-memory list of results |
| Vault       | In-memory while app runs; root path can be in session | — |
| Session     | App data directory, one JSON file | JSON object with last_vault_path, last_file_path, theme |

---

## Validation (how to check the implementation matches this model)

1. **File**: Unit or integration test: create a file with content "hello"; read it back; assert response has path, name, content and content is "hello". Assert path is under vault root.
2. **Tree node**: Unit test: parse a string with two root list items and one child; assert three nodes, correct depth and parent_id/children_ids. Unit test: parse a line with `#decision`; assert one node with tags containing "decision".
3. **Tag**: Covered by tree node test (tags array).
4. **Query and View**: Integration test: two files, each with one item with tag #decision; call query_by_tag(["decision"]); assert two results; each result has file_path and node; each node has "decision" in tags.
5. **Vault**: Integration test: open_vault(temp_dir with 2 .md files); assert root_path and file_paths length 2; each path under root_path.
6. **Session**: Integration or manual: save_session with last_vault_path; get_session; assert same value. Same for theme.

If any of these checks fail, the implementation does not match the data model; fix the implementation before adding new features.
