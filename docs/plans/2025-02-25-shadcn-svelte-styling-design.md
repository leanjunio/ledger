# shadcn-svelte frontend styling — design

**Date:** 2025-02-25  
**Status:** Approved

## Summary

Improve the markdown-app frontend styling by adopting [shadcn-svelte](https://www.shadcn-svelte.com/) as the design system. Styling only: no new features or behavior changes. All installs via the shadcn-svelte CLI; the shadcn MCP is used for discovery and pattern reference only (React registry; this app is Svelte).

---

## 1. Scope and stack

**Scope (styling only):**
- **TopBar:** "Open folder" control and current root path.
- **Sidebar:** Folder tree (expand/collapse, selection).
- **Main area:** File list ("New file", file rows, delete).
- **Editor view:** Toolbar (Save, Delete, Back), text area, preview pane.
- **Layout:** Existing structure (top bar + sidebar + main) unchanged; apply consistent look and tokens only.
- No new features; no change to Tauri commands or app behavior. E2E tests must still pass; update selectors only if class names or DOM change.

**Stack:**
- **Design system and components:** shadcn-svelte only. Add components via CLI: `npx shadcn-svelte@latest init`, then `add button`, etc.
- **MCP:** Use the shadcn MCP for discovery/reference only (e.g. which components exist, patterns for buttons/cards/dialogs). Do not use it to install React components; all installs come from shadcn-svelte.

**Out of scope for this pass:** Dark mode, new UI features (e.g. keyboard shortcuts, drag-and-drop), replacing SvelteKit or Tauri.

---

## 2. Theme and visual tokens

**Theme source:** Use shadcn-svelte’s default theme (CSS variables for color, radius, spacing). Run init and accept the default style (e.g. Neutral or Zinc) so the app gets one consistent token set.

**What we use:**
- **Surfaces:** Theme `background` and `muted` for top bar, sidebar, and main so the sidebar is slightly distinct.
- **Borders:** Theme `border` for top bar bottom, sidebar right edge, and dividers (e.g. editor/preview).
- **Typography:** Theme `foreground` and `muted-foreground` (e.g. path in TopBar). Keep theme or system font; no extra font setup.
- **Radius:** Theme border radius for buttons, list rows, and inputs.

**Light-only for now.** No custom token overrides unless needed for contrast or accessibility.

---

## 3. Component mapping

| Area | Current | Change |
|------|---------|--------|
| **TopBar** | Native button, span | Button (default/outline) for "Open folder"; path = muted text, truncation + title unchanged. |
| **Sidebar** | Divs/buttons | Same structure; theme tokens (muted bg, hover/selected states, border). |
| **File list** | Native buttons, list | "New file" → Button. File rows → theme hover/selected; delete → Button ghost/destructive. |
| **Editor** | Native buttons, textarea | Toolbar → Button (Save primary, Delete destructive, Back ghost). Editor → Textarea or themed textarea; preview → theme prose. |
| **Delete confirm** | `confirm()` | Replace with shadcn-svelte AlertDialog (title, description, Cancel + Delete). |

**Components to add via CLI:** Button, Textarea, AlertDialog. Optional: Card or ghost buttons for file rows.

---

## 4. Layout and E2E

**Layout:** Keep current structure. Apply theme tokens to wrappers (background, border) and optional spacing scale. No new breakpoints.

**E2E:** No behavior change. If refactors change class names or DOM, update selectors to stable targets (e.g. `data-testid` or role/text). Add `data-testid` only where a test would otherwise break. Run full E2E after implementation and fix any failures.

**Accessibility:** Rely on shadcn-svelte component semantics. Keep existing ARIA (e.g. tree `role="button"`, `aria-expanded`). For AlertDialog: focus management and restore on close.

---

## 5. MCP usage and implementation order

**MCP:** Discovery and reference only. Do not install via MCP; all installs via shadcn-svelte CLI.

**Implementation order:**
1. Init and theme — `npx shadcn-svelte@latest init`; theme applied at app root.
2. Add components — Button, Textarea, AlertDialog (and any others) via CLI.
3. TopBar — Button for "Open folder"; path with muted token.
4. Sidebar — Theme tokens on tree and rows (hover/selected).
5. File list — "New file" Button; rows and delete with theme + Button variants.
6. Editor — Toolbar Buttons; Textarea or themed textarea; preview prose; AlertDialog for delete.
7. Layout — Theme background/border on top bar, sidebar, main.
8. E2E — Run suite; fix selectors or add minimal `data-testid` so tests pass.

---

## Design summary

| Area | Choice |
|------|--------|
| Design system | shadcn-svelte (Svelte); install via CLI only |
| MCP | Reference only; no React component installs |
| Theme | Default light; CSS variables from init |
| Components | Button, Textarea, AlertDialog; theme tokens elsewhere |
| Scope | Styling only; E2E must pass |
