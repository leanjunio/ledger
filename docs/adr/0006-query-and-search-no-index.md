# ADR-0006: Query and Full-Text Search: No Index, Parse-on-Query, Substring Search, Result Cap

## Status

Accepted

## Context

The app must support two search modes: (1) filtering list items by tag name(s) and optional scope, and (2) finding text across files. Both features must be responsive for typical vault sizes (hundreds of items, tens of files). The specification does not require fuzzy matching for MVP, but the app must handle large result sets gracefully.

## Decision

**Query by tag:** When the user queries for items with tag `#decision`, the backend:

1. Iterates over all files in the vault (or the provided file list).
2. For each file, reads the content from disk and parses it with `markdown::parse_list_items`.
3. Filters the resulting nodes to keep only those whose `tags` array contains at least one of the requested tag names.
4. If a scope (e.g., a particular node id) is provided, filters further to keep only nodes that are descendants of that node.
5. Builds a `QueryResultItem` for each match: `{ file_path, parent_path, node }`.

There is no persistent tag index. The query always scans files. For large vaults, this scales linearly with file count and file size.

**Full-text search:** When the user searches for a string, the backend:

1. Iterates over all files in the vault.
2. For each file, reads the content and iterates line by line.
3. Checks if the line contains the query string (case-insensitive substring match).
4. If yes, adds a `SearchMatch` to the results: `{ file_path, snippet_or_line, start_offset, end_offset }`.
5. Results are capped at `MAX_RESULTS = 100` to keep the UI responsive. Once 100 matches are found, iteration stops.

A `fuzzy` parameter is accepted in the command signature, but fuzzy matching is not implemented. The fuzzy-matcher crate is in `Cargo.toml` but is not used. Fuzzy search remains a future enhancement.

## Consequences

- **Simplicity:** No index to build, maintain, or invalidate. Queries and searches always see the current file content. No cache invalidation bugs.
- **Performance:** Scales with vault size. For 10 files and 100 items total, query and search are instant. For 1000 files, a full query scan could take seconds. For MVP this is acceptable; large vaults could use debouncing in the UI or a background worker.
- **No fuzzy search:** The fuzzy parameter is silently ignored. Users who expect fuzzy matching (e.g., "hlowrld" matches "hello world") will not get it in the current version. This is a gap to address in a future update.
- **Result cap:** The `MAX_RESULTS` cap (100) ensures the UI does not become sluggish from large result sets. Users searching a huge vault will not see all matches; they must refine their query. This is consistent with user expectations from other editors (e.g., Obsidian also caps search results).
- **No sorting:** Results are returned in the order they are found (file order, line order). No ranking or relevance scoring is applied.

## References

- `src-tauri/src/commands/query.rs` (query_by_tag implementation)
- `src-tauri/src/commands/search.rs` (search_full_text implementation, MAX_RESULTS)
- `src-tauri/Cargo.toml` (fuzzy-matcher included but not used)
- `specs/001-developer-ledger/research.md` (search and query design choices)
- `specs/001-developer-ledger/contracts/tauri-commands.md` (query_by_tag and search_full_text signatures)
