# ADR-0008: Frontend Architecture: Vanilla TypeScript, Single Module State

## Status

Accepted

## Context

The frontend must be built with TypeScript (per research.md) and should be simple enough to understand and modify without a heavy framework. The MVP does not require complex component hierarchies or state management libraries. The priority is getting the core features working quickly with readable code.

## Decision

The frontend is written in **vanilla TypeScript** using **Vite** as the build tool. There is no React, Vue, Svelte, or other SPA framework. All UI logic lives in a single entry point: `src/main.ts`. The file is approximately 400 lines and implements:

1. **Global state:** A single `AppState` object holds all UI state:
   ```typescript
   const state: AppState = {
     rootPath: string | null,
     filePaths: string[],
     selectedPath: string | null,
     editorContent: string,
   }
   ```

2. **Render functions:** The UI is updated by rebuilding DOM sections when state changes:
   - `renderFileTree()` – clears and rebuilds the file list in the sidebar.
   - `renderEditor()` – clears and rebuilds the editor toolbar and textarea.
   - `updateOutline()` – parses the current file and renders the list item tree.
   - `showResults()` – displays query or search results in a panel.

3. **Event handlers:** Button clicks and input events call functions that update state and re-render:
   - `openVault()` – opens a folder picker, calls `open_vault` command, updates state.
   - `selectFile()` – reads the file, updates state, re-renders.
   - `saveFile()` – invokes `write_file` with current editor content.
   - `runQuery()` – invokes `query_by_tag` and displays results.
   - `runSearch()` – invokes `search_full_text` and displays results.

4. **Single HTML page:** One `index.html` with a fixed layout:
   - Toolbar with "Open vault", "Create file", query input, search input, theme selector.
   - Sidebar with file tree.
   - Main area with outline (parsed list items) and editor (textarea).
   - Results panel (hidden by default, shown for query/search results).

5. **Session on load:** On `DOMContentLoaded`, the frontend calls `loadSession()` to restore the last vault and file.

6. **Keyboard shortcut:** Ctrl/Cmd+S triggers `saveFile()`.

## Consequences

- **Simplicity:** One file, one module, one state object. Easy to understand, debug, and modify. No framework overhead, no build-time transpilation complexity.
- **Limited UI scalability:** As features grow, this single-file approach becomes unmaintainable. If the app adds themes, tabs, panels, or complex components, a framework or modular architecture becomes necessary.
- **No undo/redo:** The native textarea does not expose a shared undo history. Implementing undo/redo would require building a history stack in JavaScript, which is outside the scope of MVP. The specification lists undo/redo as FR-009, but it is not implemented in the current build.
- **No component reuse:** Common patterns (buttons, input fields, modals) are not abstracted. Each use is a separate inline DOM creation. If the UI needs many modals or dialogs, code duplication grows.
- **Debounced outline:** The outline is recomputed with a 300ms debounce to avoid parsing on every keystroke. This keeps the UI responsive while the user is editing.
- **Results panel:** Query and search results are shown in a side panel that can be closed. Clicking a result opens the file and hides the panel.

## References

- `src/main.ts` (all frontend logic)
- `index.html` (single page layout)
- `src/vite-env.d.ts` (TypeScript env types)
- `specs/001-developer-ledger/research.md` (frontend technology choice)
