# Spec: #3 [T1.1] Architect: shell contract (setup, theme, frame, file boundaries)

**Issue:** #3   **Plan:** [docs/plans/3-shell-contract.md](../plans/3-shell-contract.md)

## User story

As a build agent working in wave 0 (T1.3 scaffold, T1.5 theme wiring, T1.7 app frame) or a reviewer checking their PRs, I want one written shell contract, `docs/contracts/shell.md`, that fixes the setup commands, the theme, the global CSS, the root wrapper, the frame components and the npm script names before any code exists, so that each of us builds our own files without guessing or overlapping the others.

## Scope

- **In:** one new file, `docs/contracts/shell.md`, plus the PR that adds it. The facts in it about Astryx come from the Astryx CLI's own output and docs.
- **Out:** any code, `package.json`, running `npx @astryxdesign/cli init` in the repo (T1.3 does that), feature behavior, any path other than `docs/contracts/shell.md`.

## Acceptance criteria

IDs AC1 to AC7 are the issue's `done_when` and Acceptance items, in its words. AC8 to AC10 restate the issue's `must_not` and Outcome as checkable criteria and are marked derived.

| ID | Criterion | Source |
|---|---|---|
| AC1 | shell.md lists the owns of T1.3, T1.5 and T1.7 exactly as in the ownership map (docs/backlog/BACKLOG.md section 4). | issue, done_when |
| AC2 | shell.md records theme-neutral (`@astryxdesign/theme-neutral`) and the Theme import specifier printed by the CLI. | issue, done_when |
| AC3 | shell.md names the frame components (AppShell, TopNav, Layout, Heading, Stack, or the real catalog names the CLI resolves) with their specifiers and props, as the CLI printed them. | issue, done_when |
| AC4 | shell.md fixes script names: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`. | issue, done_when |
| AC5 | One branch, one PR; the body says `Closes #3` and pastes the CLI output it relied on. | issue, done_when |
| AC6 | Reading only shell.md, a person can list the setup commands (in order), the theme, and which task owns `src/main.tsx` (T1.5). | issue, Acceptance |
| AC7 | shell.md states the two global CSS imports verbatim: `@import '@astryxdesign/core/reset.css';` then `@import '@astryxdesign/core/astryx.css';` | issue, Acceptance |
| AC8 | shell.md says how Theme wraps the root (StrictMode > Theme with theme-neutral from the generated themes module > App), taken from the CLI's Theme docs. | derived (Outcome) |
| AC9 | The diff touches only `docs/contracts/shell.md` (plus this run's spec and plan); no code, no stubs with behavior, and `npx @astryxdesign/cli init` was not run in the repo. | derived (must_not) |
| AC10 | No Astryx component, import specifier or prop appears in shell.md unless the CLI printed it; any name the CLI did not resolve is replaced with the name `npx @astryxdesign/cli search <term> --type component` returned, and the substitution is recorded. | derived (must_not, backlog section 0) |
