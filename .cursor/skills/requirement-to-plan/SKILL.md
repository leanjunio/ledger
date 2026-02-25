---
name: requirement-to-plan
description: Turns a single requirement (FR, user story, or scenario) into allocation table row(s) and a plan document with Purpose, Goals, Implementation, and Validation. Use when the user asks to turn a requirement into a plan, allocate a requirement, or create a plan for a given requirement ID (e.g. FR-005, US4.1).
disable-model-invocation: false
---

# Requirement to Plan

## Purpose

This skill turns one requirement from a spec into traceable design artifacts: allocation row(s) that say which part of the system satisfies the requirement, and a plan doc that an executor can follow to implement and verify it. No assumption that the agent knows the project; the skill is the only source of the procedure.

## Overview

You will: locate the requirement and verification → name the element(s) that satisfy it → write one responsibility sentence per element → add or update an allocation table → create or update a plan doc with Purpose, Goals, Implementation, and Validation sections → optionally record design decisions. An "element" can be a capability (e.g. "Query by tag"), a layer (e.g. "Tauri command", "Sidebar UI"), or an existing artifact name. No modules required.

## When to Use

Use this skill when:
- The user asks to turn a requirement into a plan or into allocation.
- The user gives a requirement ID (e.g. FR-005, US4.1) and wants a plan or allocation.
- The user asks how to go from requirement to design/plan.

If the user did not give a requirement ID, ask: "Which requirement ID should I use (e.g. FR-005, US4.1)?"

## Instructions

Follow these steps in order. Each step is one concrete action.

### Step 0 – Get the requirement (no context assumed)

1. Locate in the project a specification file (common names: spec.md, requirements.md; often under specs/ or similar).
2. Locate a requirements-traceability or checklist file (common names: requirements-traceability.md, checklists/requirements-traceability.md).
3. If the user gave a requirement ID, search for that ID in those files. If not, ask the user for the requirement ID.
4. Copy the exact requirement text and the verification (test name or checklist row or 'manual') from the traceability doc. Write them down in your response or in a scratch section so you use them in the next steps.

### Step 1 – Name the element(s)

1. Ask: "What part of the system must do something so this requirement is met?"
2. Write one of: a capability name (e.g. 'Query by tag (backend)'), a layer (e.g. 'Tauri command', 'Sidebar UI'), or an existing artifact name.
3. If the requirement needs both backend and UI, write two elements.
4. Output: a list of element names, one per line.

### Step 2 – Write one responsibility per element

1. For each element, complete: "This [element] must [do what], so that [requirement] is satisfied."
2. One sentence per element. Be specific.
3. Output: for each element, one responsibility sentence.

### Step 3 – Add or update the allocation table

1. Locate or create the allocation table. Common locations: inside requirements-traceability.md, or a separate file (e.g. design-allocation.md in the same folder as the traceability doc).
2. Table headers must be: Req ID | Element | Responsibility | Verification.
3. Add one row per element. Req ID = requirement ID. Element = name from Step 1. Responsibility = sentence from Step 2. Verification = copy from traceability (test name or Quickstart row or 'manual').
4. If the table does not exist, create the file and add the table with these headers and the new row(s).

### Step 4 – Decide: new plan or existing plan

1. Check if a plan doc already exists that lists this requirement ID in its Purpose or Goals. Search for the requirement ID in files named plan*.md or similar in the spec folder.
2. If yes: you will update that plan in the next steps. If no: you will create a new plan file (e.g. plan-{feature}.md or plan-{req-id}.md).

### Step 5 – Create or open the plan doc

1. If new: create a file. Name it e.g. plan-us4-query.md or plan-fr005-query.md. If existing: open that file.
2. The plan doc will have exactly four sections: Purpose, Goals, Implementation, Validation.

### Step 6 – Fill Purpose and Goals

1. Purpose: List the requirement ID(s) this plan satisfies (e.g. 'FR-005, FR-006, US4.1–US4.3').
2. Goals: Write 2–4 bullet points. Each bullet states what 'done' looks like for this requirement, in spec language. Use the requirement text and acceptance criteria.

### Step 7 – Fill Implementation

1. Implementation has two parts: Elements, then Tasks.
2. Elements: Copy from the allocation table the Element and Responsibility for every requirement in this plan.
3. Tasks: Write a numbered list. Rule: put verification first (e.g. '1. Add test X that expects …' or '1. Add Quickstart step …'). Then implementation (e.g. '2. Add Tauri command Y that …', '3. In the frontend, add Z that …'). Each task is one test, one command, one component, or one small change. Do not write vague tasks like 'implement the feature.'
4. If the project has no modules, tasks refer to files, commands, or UI areas (e.g. 'In src-tauri/.../lib.rs add command query_by_tag').

### Step 8 – Fill Validation

1. Validation: List how the requirement will be verified. If automated: 'Pass test X.' If manual: 'Quickstart row N' or 'Manual: [one-line check].' This must match the traceability doc.

### Step 9 – Optional: design decisions

1. If while implementing the user or you made a non-obvious choice (e.g. 'query runs in memory, no index'), add a short 'Design' subsection in the plan or create an ADR.
2. In the allocation table, add a note or link so this requirement is tied to that decision.

## Example

**Input**: "Turn FR-005 into allocation and a plan."

**Requirement**: "FR-005: System MUST provide a query mechanism that filters list items by tag(s) and optionally by scope."

**Verification**: "test_query_by_tag; Quickstart row 5."

**Allocation row(s)**:

| Req ID | Element | Responsibility | Verification |
|--------|---------|-----------------|---------------|
| FR-005 | Query by tag (backend) | Accept tag(s) and optional scope; return matching list items from the current vault. | test_query_by_tag; Quickstart row 5 |
| FR-005 | Query results (frontend) | Show matching items with context; allow user to navigate to item in file. | Quickstart row 5b |

**Plan doc** (skeleton):

```markdown
# Plan: Query and Filtered Views (FR-005, FR-006)

## Purpose

Satisfies FR-005, FR-006, US4.1–US4.3.

## Goals

- Query mechanism filters list items by tag(s) and optional scope.
- Query results view shows matching items with enough context (e.g. parent path).
- User can navigate to item in file from results view.

## Implementation

### Elements

- **Query by tag (backend)**: Accept tag(s) and optional scope; return matching list items from the current vault.
- **Query results (frontend)**: Show matching items with context; allow user to navigate to item in file.

### Tasks

1. Add test `test_query_by_tag` that verifies filtering by tag and optional scope.
2. Implement query command that accepts tag(s) and scope, returns matches.
3. Expose query to frontend via Tauri command.
4. Add query results view in sidebar or panel; show items with context.
5. Add navigation handler so user can click result and jump to item in file.

## Validation

Pass test_query_by_tag; Quickstart rows 5, 5a, 5b.
```

## Expectation

When you are done, all of the following must be true:

- The requirement has at least one row in the allocation table with Req ID, Element, Responsibility, Verification.
- A plan doc exists with all four sections: Purpose, Goals, Implementation, Validation.
- Implementation lists Elements (from allocation) and a numbered Tasks list; verification appears before implementation where possible.
- Validation section lists the test or checklist that will verify the requirement.

If any of the above is missing, complete that step before saying you are done.

## Additional Resources

For the full 11-step procedure with execution and design-decision details, see [references/PROCEDURE.md](references/PROCEDURE.md).
