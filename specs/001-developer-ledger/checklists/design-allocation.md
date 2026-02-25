# Design allocation

| Req ID | Element | Responsibility | Verification |
| --- | --- | --- | --- |
| FR-008 | Full-text search (backend) | Run search across vault file content and return matches with file path and position. | `test_search_full_text` integration test (to add); Quickstart row 6 |
| FR-008 | Search UI (frontend) | Expose search input and results list; allow user to navigate to match in file. | `test_search_full_text` integration test (to add); Quickstart row 6 |
| FR-009 | Editor undo/redo (frontend) | Maintain undo/redo history for the current file and handle Undo/Redo so edits are reversible. | Manual only; Quickstart row 7 |
| FR-010 | Logging (backend) | Configure tracing, format logs per industry standards, and write logs to local file only. | Manual check; Quickstart row 10 |
| FR-010 | log_from_frontend command | Accept frontend log events and emit them to the same local log. | Manual check; Quickstart row 10 |
| FR-011 | Session persistence (backend) | Get and save session (last_vault_path, last_file_path) in app data. | `test_session_get_save` integration test (to add); Quickstart row 8 |
| FR-011 | Session restore (frontend) | On launch load session and open last vault/file when valid, or show empty screen/vault picker. | `test_session_get_save` integration test (to add); Quickstart row 8 |
| FR-012 | Theme (frontend) | Offer light/dark/system theme; persist in session; apply on load and after change. | Manual only; Quickstart row 9 |
| FR-013 | Editor clipboard (frontend) | Allow copy and paste into and out of the editor without blocking standard behavior. | Manual only; Quickstart row 11 |
| US1.1 | File CRUD (backend) | Create file on disk and expose create via API. | Quickstart row 2 (File CRUD) |
| US1.1 | File tree and create UI (frontend) | Provide create-new-file action and refresh tree; allow opening the new file. | Quickstart row 2 (File CRUD) |
| US1.2 | read_file (backend) | Return file content for a given path. | Quickstart row 2 (File CRUD) |
| US1.2 | Editor (frontend) | Load content when file is selected and allow editing. | Quickstart row 2 (File CRUD) |
| US1.3 | write_file (backend) | Persist file content to disk. | Quickstart row 2 (File CRUD) |
| US1.3 | Editor save (frontend) | Trigger save and keep tree in sync with persisted file. | Quickstart row 2 (File CRUD) |
| US1.4 | delete_file (backend) | Remove file from disk and expose delete via API. | Quickstart row 2 (File CRUD) |
| US1.4 | Delete UI (frontend) | Confirm delete then call delete and refresh tree. | Quickstart row 2 (File CRUD) |
| US2.1 | List parser (backend) | Parse markdown list lines so top-level items are root nodes and structure is preserved. | Quickstart row 3 (List hierarchy) |
| US2.1 | List/outline view (frontend) | Display hierarchy and allow adding top-level list items that appear as root nodes. | Quickstart row 3 (List hierarchy) |
| US2.2 | List parser (backend) | Interpret indentation so indented lines become children of the previous less-indented item; preserve parent-child relationship. | Quickstart row 3 (List hierarchy) |
| US2.2 | Editor list view (frontend) | Allow adding indented lines under an item so the child appears nested and parent-child is preserved. | Quickstart row 3 (List hierarchy) |
| US2.3 | List parser (backend) | Preserve multi-level nesting when parsing and serializing so structure is round-tripped. | Quickstart row 3 (List hierarchy) |
| US2.3 | List/outline view (frontend) | Show multi-level hierarchy and support navigation/editing so structure remains visible and navigable. | Quickstart row 3 (List hierarchy) |
| US2.4 | List parser/serializer (backend) | Serialize list hierarchy to markdown and parse on load so hierarchy is stored and restored on reopen. | Quickstart row 3 (List hierarchy) |
| US2.4 | Save flow (frontend) | Trigger save so hierarchy is written to disk and restored on reopen. | Quickstart row 3 (List hierarchy) |
| US3.1 | Tag parser (backend) | Parse tags from list item content so tags are stored with the item. | Quickstart row 4 (Tags) |
| US3.1 | Tag display (frontend) | Display tags on list items so user sees e.g. #decision. | Quickstart row 4 (Tags) |
| US3.2 | Tag persistence (backend) | Persist tag changes in markdown so edit/remove is reflected in file. | Manual check (Quickstart Tag row) |
| US3.2 | Tag editor (frontend) | Allow editing and removing tags so changes are persisted and reflected in file. | Manual check (Quickstart Tag row) |
| US3.3 | Query by tag (backend) | Return all list items matching a tag so multiple items with same tag are surfaced. | Quickstart row 5 (Query by tag) + row 4 |
| US3.3 | Query results view (frontend) | Show items matching the tag so all items with that tag are surfaced. | Quickstart row 5 (Query by tag) + row 4 |
| US4.1 | Query by tag (backend) | Accept tag and return matching list items with context so the view can show all items. | test_query_by_tag; Quickstart row 5 |
| US4.1 | Query results view (frontend) | Show all matching items with context (e.g. parent path). | test_query_by_tag; Quickstart row 5 |
| US4.2 | Query by tag with scope (backend) | Accept tag and optional scope node; return only items under that node. | test_query_by_tag (scope test); Quickstart row 5a |
| US4.3 | Query results navigation (frontend) | On select, navigate to item in file or open file so user can jump to the item. | Manual or integration; Quickstart row 5b |
| FR-001 | File CRUD (backend) | This backend must create, read, update, and delete markdown files on disk and expose these operations via Tauri API, so that users can create, open, read, edit, save, and delete markdown files. | `test_file_crud` integration test; Quickstart row 2 |
| FR-001 | Editor UI (frontend) | This frontend must provide create, open, edit, save, and delete actions and an editor area so that users can create, open, read, edit, save, and delete markdown files. | `test_file_crud` integration test; Quickstart row 2 |
| FR-002 | Vault / file list (backend) | This backend must list files in the current vault and expose the list via Tauri API, so that a tree-like view can reflect the current set of files. | `test_vault` integration test; Quickstart row 1 |
| FR-002 | Sidebar file tree (frontend) | This frontend must display a tree-like view of files in the sidebar and allow selection to open a file, so that FR-002 is satisfied. | `test_vault` integration test; Quickstart row 1 |
| FR-003 | List hierarchy parser (backend) | This backend must interpret list structure in markdown as parent/child hierarchy and preserve it on parse and serialization, so that hierarchy is preserved on edit and save. | `parse_two_root_one_child` unit test; Quickstart row 3 |
| FR-003 | Editor hierarchy (frontend) | This frontend must display and allow editing of list items as a hierarchy (e.g. indentation, expand/collapse) so that list structure is interpreted as hierarchy and preserved. | `parse_two_root_one_child` unit test; Quickstart row 3 |
| FR-004 | Tag parsing and storage (backend) | This backend must parse tags from list item content and store them with content when saving, so that tags persist with the file. | `parse_tags_decision_ci` unit test; Quickstart row 4 |
| FR-004 | Tag input and display (frontend) | This frontend must allow users to add, edit, and remove tags on list items and display tags, so that users can associate tags with list items and see them. | `parse_tags_decision_ci` unit test; Quickstart row 4 |
| FR-005 | Query by tag (backend) | This backend must accept tag(s) and optional scope (node) and return matching list items from the current vault, so that the query mechanism filters by tag(s) and optional scope. | `test_query_by_tag` integration test (to add); Quickstart row 5a |
| FR-005 | Query UI (frontend) | This frontend must provide a way to run a query by tag(s) and optional scope and trigger the backend query, so that users can filter list items by tag(s) and scope. | `test_query_by_tag` integration test (to add); Quickstart row 5a |
| FR-006 | Query results (frontend) | This frontend must present query results in a view with enough context to locate each item in the hierarchy and support navigation to the item in the file, so that FR-006 is satisfied. | `test_query_by_tag` integration test (to add); Quickstart row 5b |
| FR-006 | Query API with context (backend) | This backend must return matching list items with context (e.g. parent path, file) so that the results view can show context and support navigation to the item. | `test_query_by_tag` integration test (to add); Quickstart row 5b |
| FR-007 | Markdown persistence (backend) | This backend must persist all file data as markdown (or editable text) only, with no opaque binary-only storage for hierarchy or tags, so that FR-007 is satisfied. | Covered by `test_file_crud` and FR-001 |
| FR-007 | Editor content (frontend) | This frontend must edit and save content as text/markdown only and not introduce binary-only storage, so that all data remains in markdown. | Covered by `test_file_crud` and FR-001 |
| Edge-1 | Empty file handling | Support empty or new file without errors; tree and editor show valid state. | Manual; Quickstart Edge cases – empty file |
| Edge-2 | Parser resilience | Handle malformed or mixed markdown without crash; show graceful behavior (e.g. partial list or raw). | Manual; Quickstart Edge cases – malformed |
| Edge-3 | List parser and tree (backend) | Support parsing and representing many nesting levels without hard limits that break or truncate. | Manual; Quickstart Edge cases – deep hierarchy |
| Edge-3 | Hierarchy UI (frontend) | Render and navigate deep nesting so it remains usable and performant. | Manual; Quickstart Edge cases – deep hierarchy |
| Edge-4 | Tag matching (backend) | Match tags by exact name; do not auto-deduplicate or fuzzy-match tag names for MVP. | Manual; Quickstart Edge cases – duplicate tags |
| Edge-5 | Query (backend) | Return empty list when no items match; do not error. | Manual; Quickstart Edge cases – empty query |
| Edge-5 | Query results view (frontend) | Show clear empty state when result set is empty (e.g. "No items match"). | Manual; Quickstart Edge cases – empty query |
| Edge-6 | Vault and query (backend) | List files and run query efficiently so large datasets do not block. | Manual; Quickstart Edge cases – large dataset |
| Edge-6 | Tree and query UI (frontend) | Render and update tree and query results so UI stays responsive for large datasets. | Manual; Quickstart Edge cases – large dataset |
