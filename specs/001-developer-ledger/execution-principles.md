# Execution principles: How to use these plans

**Branch**: `001-developer-ledger`  
**Audience**: Whoever is implementing the plan (person or automated agent). Assume the executor has **no prior knowledge** of software development, markdown, or this project.

---

## Purpose of this document

This file tells you how to read and execute the other documents in this folder (plan.md, research.md, data-model.md, contracts/, quickstart.md). Follow these rules so that implementation stays correct and verifiable at every step.

---

## Who is the executor?

The executor is assumed to be:

- **Not familiar** with software development, markdown, Rust, TypeScript, or Tauri.
- **Limited context**: cannot hold the whole project in mind; must rely on the documents.
- **Execution-only**: their job is to follow the plans step by step, not to invent or guess.
- **Validation-focused**: they must be able to check after each step that the step was done correctly.

So every plan and section must be **extremely explicit**. No jargon without definition. No "do the usual thing." No steps that require guessing.

---

## Rules for all plans and implementation docs

1. **One thing per plan (or per phase)**  
   Each plan, or each phase inside a plan, must do exactly one thing. Example: "Phase 1: Scaffold Tauri project" is one thing. "Phase 2: Implement vault open" is another. Do not mix multiple features in a single plan.

2. **Every plan (or phase) has four sections**  
   - **Purpose**: In one sentence, why this plan/phase exists and what document or spec requirement it serves.
   - **Goals**: What must be true when this plan is done (checkable list).
   - **Implementation**: Numbered steps. Each step is a single, unambiguous action. No step may require the executor to "figure it out."
   - **Validation**: How to verify that the goals were met. This must be concrete: run this command, open this file, check that X is visible. If the spec has acceptance criteria or FRs, validation must reference them.

3. **TDD and spec-driven**  
   - The **single source of truth** for *what* to build is `spec.md` (feature specification).  
   - Before implementing a feature, the executor must know which **functional requirement (FR)** or **user story** it satisfies.  
   - Where the constitution or spec require tests: write or run the test **before** or **immediately after** the implementation step, and the test must **fail** before implementation and **pass** after.  
   - At every level (phase, task, step), the executor must be able to validate: "Did I satisfy the goal for this step?" using the spec or the plan's own validation section.

4. **No guesswork**  
   - If a step says "use library X," the research or plan must state the exact crate/package name and, where possible, version or version range.  
   - If a step depends on a concept (e.g. "vault," "list item"), that concept must be defined in the plan or in the glossary below before it is used.  
   - If something is intentionally left to the executor (e.g. "choose one of A or B"), the document must list A and B explicitly and say how to choose.

---

## Where to get more information (and what NOT to use)

When the executor needs to look up a library, framework, or language:

### Authorized sources (use these)

- **Rust**: Official Rust book (https://doc.rust-lang.org/book/), standard library docs (https://doc.rust-lang.org/std/). For crates: docs on docs.rs for the **exact crate and version** named in research.md or plan.md.
- **TypeScript**: TypeScript handbook (https://www.typescriptlang.org/docs/handbook/). Use the version stated in the plan (e.g. ES2020+).
- **Tauri**: Official Tauri v2 docs only: https://v2.tauri.app/ — start with "Getting started" and "Prerequisites." Use the exact Tauri version in the plan (2.x).
- **Markdown (for this project)**: The definition of "list" and "list item" for Ledger is in this spec folder: see plan.md glossary and data-model.md. Do not assume other markdown flavors (e.g. GitHub Flavored Markdown) unless the plan says so.
- **Project-specific terms**: Always prefer the definitions in `spec.md`, `plan.md`, and `data-model.md` over external definitions.

### Wrong or misleading sources (do NOT use for decisions)

- **Random blog posts or Stack Overflow** for "how to do X in Tauri/Rust" unless the plan explicitly points to one. They often refer to old Tauri v1 or different patterns.
- **Tauri v1 documentation** (v1.tauri.app or old guides). This project uses **Tauri v2** only.
- **Generic "markdown" specs** (e.g. CommonMark) to define what a "list item" or "tag" is in Ledger. Ledger's list and tag rules are in the spec and data model.
- **Other note-taking apps' behavior** (Obsidian, Notion, etc.) as the source of truth. The spec says "Obsidian-like" only where explicitly written; the actual requirements are in spec.md.
- **AI-generated code or snippets** that are not grounded in the plan/research/contracts. If you use generated code, it must be checked against the contracts and data model line by line.

When in doubt: **the spec and the plan win**. If an external source contradicts spec.md or plan.md, follow the spec and plan.

---

## Glossary (minimal; full definitions in plan.md)

- **Vault**: A folder on the user's computer that the user chooses. All markdown files for one "workspace" live inside this folder. The app only works with one vault at a time.
- **Markdown**: A plain-text format. For Ledger, the important part is **lists**: lines that start with `-` or `*` and can be indented to show nesting. Each such line is a **list item**.
- **List item**: One line in a markdown list. It can contain text and **tags** (words prefixed with `#`, e.g. `#decision`).
- **Tag**: In Ledger, a word like `#decision` or `#ci` written inside a list item. Used later to find all items that have that tag.
- **Spec**: The file `spec.md` in this folder. It lists what the product must do (functional requirements, user stories, success criteria). Implementation must satisfy the spec.
- **FR**: Functional requirement. Numbered in spec.md (FR-001, FR-002, …). Each implementation step should trace to at least one FR where applicable.
- **TDD**: Test-driven development. For this project: write or run the test that corresponds to the spec/plan step, see it fail, then implement until it passes. Do not implement large blocks without a way to validate.

---

## Order of reading and execution

1. Read **spec.md** to know *what* the product must do (high level).
2. Read **execution-principles.md** (this file) to know *how* to execute.
3. Read **plan.md** (Purpose, Goals, Technical Context, Glossary, then each phase).
4. Read **research.md** for exact technology choices and wrong sources.
5. Read **data-model.md** for entities and validation of the model.
6. Read **contracts/tauri-commands.md** for backend–frontend API.
7. Use **quickstart.md** for environment setup, build, run, and final validation.

When implementing: one phase or one task at a time. After each phase, run that phase's Validation section before moving on.
