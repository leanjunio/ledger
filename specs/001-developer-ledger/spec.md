# Feature Specification: Developer Ledger MVP

**Feature Branch**: `001-developer-ledger`  
**Created**: 2025-02-24  
**Status**: Draft  
**Input**: User description: "Developer Ledger, a markdown-based text editor with tree structure, file CRUD, decision hierarchy, and tagging/query for recall."

## Clarifications

### Session 2025-02-24

- Q: Problem & goals — What problem does Ledger solve and what does success look like? → A: Project notes often become implementation/details notes (good for deep dives, bad for keeping track in one place). Tools like Airtable/Miro/Productboard suit teams; Ledger targets personal tracking and personal knowledge repository. Success = Obsidian-like functionality plus the ledger tree system.
- Q: Persona — Who is the user? → A: Anyone on a team who needs to keep track of their own information for second-brain recap.
- Q: Scope boundaries — What is out of scope for MVP? → A: Anything not in the earlier requirements; examples: plugins, git connectivity, mobile responsiveness, web capabilities.
- Q: Platform — Where does Ledger run? → A: Desktop, like Obsidian.
- Q: Workspace & files — How do workspace and files work? → A: Same as Obsidian (vault = folder; markdown files in it).
- Q: Query scope — Does query/search run over one file or all files? → A: Fuzzy-finding capability; search runs across all files in the workspace.
- Q: Search — Is full-text search in scope? → A: Yes; search within text across files, same expectation as Obsidian.
- Q: Errors — How should errors be handled and logged? → A: Format logs to industry-standard expectations; save logs on the user's local device.
- Q: Undo/redo — Is undo/redo in scope? → A: Yes; match Obsidian's undo and redo behavior.
- Q: First-run — What does the user see on first launch or when empty? → A: Last opened file or an empty screen.
- Q: Input / shortcuts — Keyboard and shortcuts expectations? → A: Whatever is expected of Obsidian (keyboard-first, standard shortcuts).
- Q: Accessibility — Requirements? → A: Keyboard-only primary; mouse as needed.
- Q: Styling — Theming? → A: Light and dark themes.
- Q: Privacy / telemetry — Where does data live? → A: Local file storage only.
- Q: Export / import — How do users get content in and out? → A: Copy-paste content in and out of the editor (standard text editor behavior).
- Q: Implementation and plan documentation — How should plans and research be written for the executor? → A: Assume the executor has no software development or markdown knowledge and limited context. Every plan (or phase) must have Purpose, Goals, Implementation, and Validation. One feature or one phase per plan. TDD and spec-driven: validate at every level against the spec (FRs, acceptance criteria). Define authorized and wrong sources for tech stack research. Documents must be detailed enough that the executor can depend on them with no guesswork. See execution-principles.md in the spec folder.

## Problem statement & product goals

**Problem**: Project notes are often written as implementation or "details" notes—useful for deep dives but not for keeping track of information in one place. Team-oriented tools (Airtable, Miro, Productboard) don't fit single-user or small-team personal tracking. Ledger addresses personal knowledge repository and second-brain recap needs.

**Product goals**: Success looks like Obsidian-level editor functionality (files, tree, search, shortcuts, themes) plus the Ledger-specific tree system (hierarchical list structure and tag-based query/recall). Target: anyone on a team who needs to track their own information for personal recap.

## Persona

**Primary user**: Anyone part of a team who needs to keep track of their own information for their own second-brain recap. They use Ledger as a personal tracking and knowledge repository tool, not for real-time collaboration.

## Platform & scope

**Platform**: Desktop application (same deployment model as Obsidian—native desktop, one workspace/vault at a time).

**Out of scope for MVP**: Plugins; git connectivity; mobile responsiveness; web capabilities. Anything not listed in the functional requirements or user stories above is out of scope unless explicitly added later.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - File and tree editor basics (Priority: P1)

As a user, I can create, open, edit, save, and delete markdown files and see a tree-like structure of my files on the side so that I can work in a familiar editor layout and navigate my notes quickly.

**Why this priority**: Without file CRUD and a visible file tree, no other feature (hierarchy, tags, query) is usable.

**Independent Test**: Create a new file, add content, save, and see it appear in the side tree; open it again and edit. Delivers a working editor with file navigation.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user creates a new file and names it, **Then** the file appears in the side tree and can be opened for editing.
2. **Given** a file exists in the tree, **When** the user selects it, **Then** its content is shown in the editor and can be edited.
3. **Given** the user has edited a file, **When** the user saves, **Then** changes are persisted and the file remains available in the tree.
4. **Given** a file exists, **When** the user deletes it (with confirmation), **Then** the file is removed from the tree and from storage.

---

### User Story 2 - Hierarchical list structure (decision tree) (Priority: P2)

As a user, I can organize a single markdown file as a hierarchy of list items (e.g. project → sub-project/task → subtask → point) so that I can track everything for a project in one place and avoid scattering decisions across many notes.

**Why this priority**: The core differentiator is "one file = one project's hierarchy"; without it, Ledger is just another editor.

**Independent Test**: Open a file, add a top-level list item as a project, add nested children (task, subtask, point), and see the hierarchy reflected. Delivers the ability to record structure in one note.

**Acceptance Scenarios**:

1. **Given** a file is open, **When** the user adds a top-level list item (e.g. project name), **Then** it appears as a root node in the hierarchy.
2. **Given** a list item exists, **When** the user adds a child list item under it, **Then** the child is shown as nested and the parent-child relationship is preserved.
3. **Given** a multi-level hierarchy exists, **When** the user views or edits the file, **Then** the structure is preserved and navigable (e.g. expand/collapse or visual indentation).
4. **Given** the user has built a hierarchy, **When** they save, **Then** the hierarchy is stored in the markdown and restored on reopen.

---

### User Story 3 - Tagging list items (Priority: P3)

As a user, I can attach tags (e.g. `#decision`, `#ci`) to any list item in the hierarchy so that I can later find all items of a given type (e.g. all decisions) without digging through the whole tree.

**Why this priority**: Tags enable recall; without them, hierarchy alone does not solve "find past decisions."

**Independent Test**: Add tags to several list items at different levels, then use a tag-based filter (in User Story 4) to see only those items. Delivers traceability of decisions and categories.

**Acceptance Scenarios**:

1. **Given** a list item is visible, **When** the user adds a tag (e.g. `#decision`) to that item, **Then** the tag is stored with the item and displayed.
2. **Given** an item has one or more tags, **When** the user edits or removes a tag, **Then** the change is persisted and reflected in the file.
3. **Given** multiple items have the same tag, **When** the user later queries by that tag, **Then** all such items can be surfaced (see User Story 4).

---

### User Story 4 - Query and filtered views (Priority: P4)

As a user, I can run a query to filter items by tag(s) and optionally by scope (e.g. under a chosen project, task, or subtask) so that I can quickly see all decisions or other tagged items without scanning the full hierarchy.

**Why this priority**: Query makes tagging useful for recall; completes the "decision tracker" value.

**Independent Test**: Create a hierarchy with tagged items (e.g. #decision, #ci), then open a query view filtered by one tag or by tag + scope; verify only matching items appear. Delivers the "find past decisions" outcome.

**Acceptance Scenarios**:

1. **Given** the app has files with tagged list items, **When** the user runs a query for a specific tag (e.g. #decision), **Then** a view shows all list items that have that tag, with enough context (e.g. parent path) to locate them.
2. **Given** the user can query by tag, **When** they optionally restrict scope to a project/task/subtask, **Then** only items under that node are included in the results.
3. **Given** query results are shown, **When** the user selects an item, **Then** they can navigate to that item in the file (or open the file at that item).

---

### Edge Cases

- **Empty or new file**: Tree shows the file; hierarchy and tags apply once the user adds list items.
- **Malformed or mixed markdown**: List structure and tags are parsed where valid; invalid or non-list content does not break the app (e.g. shown as plain content or clearly separated).
- **Very deep hierarchy**: System supports a reasonable depth (e.g. many levels); performance and navigation remain usable.
- **Duplicate or similar tag names**: Tags are matched by exact name; no automatic deduplication required for MVP.
- **Empty query results**: Query returns an empty result set with a clear indication; no error.
- **Large number of files or items**: Tree and query remain responsive for typical single-user usage (e.g. hundreds of items).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create, open, read, edit, save, and delete markdown files.
- **FR-002**: System MUST display a tree-like view of files (e.g. sidebar) that reflects the current set of files and allows selection to open a file.
- **FR-003**: System MUST interpret list structure in markdown as a hierarchy (parent/child) and preserve it on edit and save.
- **FR-004**: System MUST allow users to associate one or more tags with a list item; tags are stored with the content and persist with the file.
- **FR-005**: System MUST provide a query mechanism that filters list items by tag(s) and optionally by scope (a chosen node in the hierarchy).
- **FR-006**: System MUST present query results in a view that shows matching items with enough context to locate them in the hierarchy and open/navigate to the item.
- **FR-007**: System MUST persist all data in markdown (or a format that remains editable as text); no opaque binary-only storage for hierarchy or tags.
- **FR-008**: System MUST provide full-text search within file content across the workspace (fuzzy-finding capability across all files), with results navigable to the matching location, consistent with editor expectations (e.g. Obsidian-like).
- **FR-009**: System MUST support undo and redo for edits in the current file, with behavior consistent with standard editor expectations (e.g. Obsidian-like).
- **FR-010**: System MUST format application and error logs according to industry-standard expectations and write logs to the user's local device only.
- **FR-011**: On launch, system MUST show the user's last opened file when available, or an empty screen when there is no previous session or workspace.
- **FR-012**: System MUST offer light and dark themes (user-selectable or system-following).
- **FR-013**: Users MUST be able to copy and paste content into and out of the editor (standard text editor copy-paste behavior).

### Non-functional & quality

- **Accessibility**: Primary interaction via keyboard; mouse as needed. Shortcuts and input behavior aligned with Obsidian-like expectations.
- **Privacy**: All data stored locally; no cloud sync or telemetry in MVP.

### Key Entities

- **File**: A markdown document; has a name, path (or identifier), and content. Content includes list structure and inline tags.
- **Tree node (list item)**: A single list item in the hierarchy; has optional parent and children, text content, and zero or more tags.
- **Tag**: A label (e.g. #decision, #ci) attached to a list item; used for filtering and recall.
- **Query**: A user-defined filter (tag(s), optional scope); produces a result set of matching list items.
- **View**: A presentation of query results (list of items with context) that supports navigation to the source item/file.

## Assumptions

- Single user, local-first usage; no multi-user or real-time sync required for MVP.
- Workspace and files behave like Obsidian: one vault (root folder) at a time; markdown files live in that folder; user opens or creates a vault on launch or when empty.
- Query and full-text search run across all files in the current workspace (not limited to the current file).
- Hierarchy is represented using markdown list syntax (e.g. `-` or `*` with indentation); exact syntax is an implementation detail.
- Tags are inline in the list item text (e.g. `- Do the thing #decision #ci`); no separate tag database required for MVP.
- "Tree view" of files refers to the file list in the sidebar; the hierarchy of list items may be shown in the same sidebar (e.g. outline) or in the editor area.
- Open product decisions can be recorded in a regular note; no dedicated spec section required for MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new file, add a few list items with one level of nesting, and save in under one minute.
- **SC-002**: Users can open a file from the tree and see its content (including list structure) in under three actions (e.g. click file, see content).
- **SC-003**: Users can tag at least five list items across different levels and then see all of them in a tag-based query result in under 30 seconds from starting the query.
- **SC-004**: Users can narrow a query by scope (e.g. "under this project") and get only items under that node, verifiable by manual check.
- **SC-005**: After closing and reopening the app, files, hierarchy, and tags persist and are restored without data loss for the MVP scope.
- **SC-006**: Users can run a full-text search across the workspace and navigate to a match in under five actions from starting the search.
