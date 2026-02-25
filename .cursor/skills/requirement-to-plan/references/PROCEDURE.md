# Full Requirement-to-Plan Procedure

This document provides the complete 11-step procedure for turning a requirement into allocation and execution plan. The main SKILL.md covers steps 0–9; this document adds steps 10–11 (execution and design-decision recording).

## Overview

1. Locate the requirement
2. Name the element(s)
3. Write responsibility per element
4. Add or update allocation table
5. Decide: new plan or existing
6. Create or open plan doc
7. Fill Purpose and Goals
8. Fill Implementation (Elements + Tasks)
9. Fill Validation
10. Execute the plan (optional: for full workflow)
11. Record design decisions (optional: for non-obvious choices)

---

## Step 0: Locate the requirement

- Find the specification file (spec.md, requirements.md, typically in specs/ folder).
- Find the requirements-traceability doc (requirements-traceability.md, often in checklists/).
- Search for the requirement ID (e.g. FR-005, US4.1).
- Copy the exact requirement text and verification (test name, Quickstart row, or 'manual').

---

## Step 1: Name the element(s)

Ask: "What part of the system must do something so this requirement is met?"

Answer with one or more:
- **Capability**: e.g. "Query by tag", "File CRUD", "Full-text search", "Session restore".
- **Layer/boundary**: e.g. "Tauri command (backend)", "Sidebar UI", "Editor component", "App state".
- **Artifact**: if one already exists, use its name.

If the requirement needs both backend and frontend, name two elements.

Output: list of element names.

---

## Step 2: Write one responsibility per element

For each element, complete this sentence:

**"This [element] must [do what], so that [requirement] is satisfied."**

Be specific; one sentence per element.

Example:
- "Query by tag (backend)" → "Accept tag(s) and optional scope; return matching list items from the current vault."
- "Query results (frontend)" → "Show matching items with context; allow user to navigate to item in file."

---

## Step 3: Add or update the allocation table

**Locate or create the allocation table:**

Common locations:
- Inside requirements-traceability.md (add a section).
- Separate file, e.g. design-allocation.md, in the same folder as the traceability doc.

**Table structure:**

| Req ID | Element | Responsibility | Verification |
|--------|---------|-----------------|---------------|
| [Requirement ID] | [Element name] | [Responsibility sentence] | [Test or Quickstart row or 'manual'] |

Add one row per element:
- **Req ID**: the requirement ID from Step 0.
- **Element**: the name from Step 1.
- **Responsibility**: the sentence from Step 2.
- **Verification**: copy from traceability doc (test name, Quickstart row, or 'manual').

**If the table does not exist:**

Create a new file (e.g. design-allocation.md) and add the table with headers and rows.

---

## Step 4: Decide: new plan or existing plan

Search the spec folder for files named plan*.md or similar.

Check if any existing plan doc lists this requirement ID in its Purpose or Goals section.

- **If found**: you will update that plan in the next steps.
- **If not found**: you will create a new plan file.

---

## Step 5: Create or open the plan doc

**If new plan:**
- Create a file in the spec folder.
- Name: e.g. plan-us4-query.md, plan-fr005-query.md, or plan-{feature-name}.md.
- The plan doc will have exactly four sections: Purpose, Goals, Implementation, Validation.

**If existing plan:**
- Open the file; you will add to or update the Implementation section.

---

## Step 6: Fill Purpose and Goals

**Purpose:**
- List the requirement ID(s) this plan satisfies.
- Example: "Satisfies FR-005, FR-006, US4.1–US4.3."

**Goals:**
- Write 2–4 bullet points.
- Each bullet describes what 'done' looks like for this requirement, in spec language.
- Use the requirement text and acceptance criteria from the spec.

Example goals (for FR-005 + FR-006):
- Query mechanism filters list items by tag(s) and optional scope.
- Query results view shows matching items with enough context (e.g. parent path).
- User can navigate to item in file from results view.

---

## Step 7: Fill Implementation

### Part A: Elements

Copy from the allocation table the **Element** and **Responsibility** for every requirement in this plan.

Example:

```markdown
### Elements

- **Query by tag (backend)**: Accept tag(s) and optional scope; return matching list items from the current vault.
- **Query results (frontend)**: Show matching items with context; allow user to navigate to item in file.
```

### Part B: Tasks

Write a numbered list of concrete steps.

**Rule: put verification first**, then implementation.

Example:

```markdown
### Tasks

1. Add test `test_query_by_tag` that verifies filtering by tag and optional scope.
2. Implement query command that accepts tag(s) and scope, returns matches.
3. Expose query to frontend via Tauri command.
4. Add query results view in sidebar or panel; show items with context.
5. Add navigation handler so user can click result and jump to item in file.
```

**Task guidelines:**
- Each task is one test, one command, one component, or one small change.
- Do not write vague tasks like 'implement the feature.'
- If the project has no modules, tasks refer to files, commands, or UI areas: e.g. "In src-tauri/.../lib.rs add command query_by_tag"; "In sidebar component add query results panel."

---

## Step 8: Fill Validation

List how the requirement will be verified:

- **If automated**: "Pass test X" (e.g. "Pass test_query_by_tag").
- **If manual**: "Quickstart row N" or "Manual: [one-line check]" (e.g. "Manual: Query by tag shows results in <3 seconds").

This must match the Verification column in the allocation table.

Example:

```markdown
## Validation

Pass test_query_by_tag; Quickstart rows 5, 5a, 5b.
```

---

## Step 9: Optional — Design decisions

If while implementing, a non-obvious choice was made:

**Add a Design subsection:**

```markdown
## Design

**Decision**: Query runs in-process over parsed trees; no index.
**Consequence**: Simple implementation, adequate for MVP scope; may need indexing if vault grows to 1000+ items.
```

**Or create/update an ADR** (Architecture Decision Record):

Store in docs/adr/ with filename like 0003-in-memory-query.md. Link from the allocation table or plan.

**In the allocation table**, add a note or link:

| Req ID | Element | Responsibility | Verification | Design Note |
|--------|---------|-----------------|---------------|-------------|
| FR-005 | Query by tag (backend) | Accept tag(s) and optional scope; return matching list items from the current vault. | test_query_by_tag | See design note: in-memory query (ADR-0003) |

---

## Step 10: Execute the plan

Work through the Tasks in order (verification first, then implementation):

1. For each task, complete the work.
2. Mark the task done (e.g. "✓" or "Done").
3. When all tasks are done, run or perform the Validation step.
4. If validation passes: mark the plan complete; in the requirements-traceability table, set **Status** for this requirement to "Pass" (and date/notes if you track them).
5. If validation fails: fix and re-validate.

---

## Step 11: Record in traceability

After the plan is complete and validated:

1. Open requirements-traceability.md.
2. Find the row(s) for this requirement.
3. Set **Status** to "Pass" (and date if tracked).
4. Add any notes (e.g. "Completed 2025-02-25", "All acceptance scenarios passed", or design decisions noted in plan or ADR).
5. Optionally link the plan doc in the Notes column so others can reference it.

---

## Summary: Allocation → Plan → Execution → Traceability

This procedure creates a **traceable chain**:

1. **Requirement** (spec) → **Allocation table** (who does what).
2. **Allocation** → **Plan doc** (how to implement).
3. **Plan doc** → **Execution** (do the work, verify).
4. **Execution result** → **Traceability** (requirement is "Pass", date, design notes).

So anyone can follow: requirement ID → allocation rows → plan → verification, and see exactly how and when the requirement was satisfied.
