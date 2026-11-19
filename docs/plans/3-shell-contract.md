# Technical Plan: #3 [T1.1] Architect: shell contract (setup, theme, frame, file boundaries)

**Ticket:** #3   **Spec:** [docs/specs/3-shell-contract.md](../specs/3-shell-contract.md)   **Status:** Draft

## 1. Summary

The deliverable is one Markdown file, `docs/contracts/shell.md`. It is the contract the wave-0 build tasks (T1.3 scaffold, T1.5 theme and global CSS, T1.7 app frame) and their reviewers work from. It fixes the setup commands in order, the theme (`@astryxdesign/theme-neutral`), the two global CSS imports, how Theme wraps the root, which Astryx components build the frame (with the import specifiers and props the Astryx CLI prints), the npm script names, and each task's owned files. Every Astryx fact in it is copied from CLI output that the PR body pastes. No code is written.

## 2. Requirements

### User story and acceptance criteria

See the spec. AC1 to AC7 come from the issue; AC8 to AC10 are derived.

### Non-functional requirements

- **Traceability.** Each Astryx name, specifier and prop in shell.md can be matched to a line of CLI output in the PR body (T1.2 checks this).
- **Self-contained.** A reader needs only shell.md for AC6. Link to BACKLOG.md for background, but do not make shell.md depend on it for the facts AC1 to AC8 ask for.

### Out of scope

Code of any kind; `package.json`; running `npx @astryxdesign/cli init` or `theme` in the repo; choosing a theme other than theme-neutral; specifying behavior of the task screen.

### Assumptions

- A1. The developer can run `npx @astryxdesign/cli ...` with network access. The planner could not run it in this session (the command was refused by the session's permission policy), so **no CLI output has been verified yet**: every Astryx specifier and prop in this plan is a placeholder to be filled from CLI output.
- A2. Running the CLI's read-only commands (`--help`, `component`, `search`, `init --help`, `theme --help`) outside the repo, for example in a temp directory, does not count as running `init` in the repo.

## 3. Current state

Verified by reading the repo at `26fe59d`:

- `main` has one commit; the only content is `docs/backlog/BACKLOG.md` and `docs/backlog/issues.json`. There is no `docs/contracts/` directory, no `package.json`, no `src/`.
- BACKLOG.md section 4 (File-ownership map) gives the owns this contract must copy:
  - **T1.3:** `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `README.md`, `src/vite-env.d.ts`, `src/test/setup.ts`, `playwright.config.ts`, and every file `npx @astryxdesign/cli init` or `theme` writes (listed in its PR body).
  - **T1.5:** `src/main.tsx`, `src/index.css`.
  - **T1.7:** `src/App.tsx`, `src/App.test.tsx`, and deletes `src/App.css`, `src/assets/react.svg`, `public/vite.svg`.
- Issue bodies T1.3, T1.5 and T1.7 in BACKLOG.md section 3 give the setup commands, script definitions, Vitest/Playwright settings and frame landmarks the contract restates.

## 4. Proposed design

### Changes by component

| File | Change | New or modified |
|---|---|---|
| `docs/contracts/shell.md` | The shell contract, sections below | New |

### Required sections of shell.md

1. **Purpose and readers.** One paragraph; who uses it (T1.3, T1.5, T1.7 and their reviews T1.4, T1.6, T1.8; T2.1 reads it).
2. **Setup commands, in order** (AC6). From T1.3's inputs:
   1. `npm create vite@latest . -- --template react-ts` (choose "ignore existing files"; never remove `docs/**`)
   2. `npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli`
   3. `npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test`
   4. `npx @astryxdesign/cli init` (if it does not produce a themes module with theme-neutral, the `theme` subcommand, using flags `theme --help` prints)
   5. `npx @astryxdesign/cli doctor`
   6. `npx playwright install chromium`
   State which task runs them (T1.3) and that the developer of T1.1 did not run 4.
   If `init --help` shows that `init` installs packages or needs flags, record its real flags and adjust the order, citing the help output.
3. **Theme** (AC2, AC8). `@astryxdesign/theme-neutral`, consumed only through the themes module the CLI generates (record the module path `init --help`/docs give, or say T1.3 records it in README if the CLI does not state it ahead of time). The Theme component's import specifier and the prop that takes the theme, verbatim from `npx @astryxdesign/cli component Theme`. The render tree: `StrictMode > Theme (theme-neutral) > App` in `src/main.tsx`.
4. **Global CSS** (AC7). `src/index.css` contains exactly, in this order:
   ```css
   @import '@astryxdesign/core/reset.css';
   @import '@astryxdesign/core/astryx.css';
   ```
   and nothing else; `src/main.tsx` imports `./index.css`.
5. **Frame components** (AC3, AC10). A table: catalog name, import specifier, props used and their meaning, role in the frame. Components to confirm: AppShell, TopNav, Layout, Heading, Stack. For each, run `npx @astryxdesign/cli component <Name>`; if one does not resolve, run `npx @astryxdesign/cli search <term> --type component`, use the real name, and note the substitution. List only the props the frame needs, each one as printed.
   Then the frame shape T1.7 builds: a banner landmark whose only `h1` is the app name, and a main landmark that renders only `<TaskScreen />`. Say which component yields each landmark according to the CLI output; if none does, say T1.7 supplies the landmark with the semantic element and record why.
   Fix the app name string here (assumption: "Todo"; see open question Q1).
6. **npm scripts** (AC4). `dev`, `build`, `preview`, `typecheck`, `lint`, `test` (`vitest run`), `test:e2e` (`playwright test`), with T1.3's test settings: Vitest jsdom, `setupFiles: src/test/setup.ts`, `passWithNoTests: true`, excludes `e2e/**`; Playwright `testDir: e2e`, webServer `npm run build && npm run preview`, projects Desktop Chrome and Pixel 7.
7. **File ownership** (AC1, AC6). A table of T1.3, T1.5 and T1.7 owns copied exactly from BACKLOG.md section 4, plus `docs/contracts/shell.md` → T1.1. One sentence: `src/main.tsx` is owned by T1.5.
8. **Rules for every shell task.** Import Astryx only from specifiers the CLI prints; no hard-coded colors, spacing, radii, shadows or fonts; no CSS files beyond `src/index.css`; no inline styles.
9. **CLI version.** The `@astryxdesign/cli` version the output came from (`npx @astryxdesign/cli --version` or the version npx resolved).

### Error handling and edge cases

- A frame component does not exist in the catalog → search, substitute, record (AC10).
- The CLI prints a different global CSS path from the issue's → still state the issue's two lines verbatim (AC7) and add a note flagging the mismatch for the reviewer; do not silently change them.
- `init --help` shows `init` itself writes `src/main.tsx` or `src/index.css` → record that, and restate that T1.3 keeps the CLI's change and lists it while T1.5 owns the files afterwards (T1.3's must_not already says this).

## 5. Key decisions

| Decision | Choice | Rationale | Alternatives rejected |
|---|---|---|---|
| Where Astryx facts come from | CLI output only, pasted into the PR body | Issue must_not; reviewers can diff contract against output | Docs-site reading alone (not checkable by T1.2) |
| Where the CLI is run | A temp directory outside the repo | Reads `--help`/`component` without writing files to the repo; `init` in the repo belongs to T1.3 | Running in the repo (could write files T1.1 does not own) |
| Feature flag | None; see section 8 | The deliverable is a Markdown document with no runtime | Env var flag (nothing would read it) |

No ADR: the significant decisions (theme, tooling) were already made in the backlog; this contract records them.

## 6. Implementation tasks

### T1. Collect CLI output (S)
- Goal: the raw Astryx facts the contract needs, saved for the PR body.
- Changes: none in the repo. In a temp directory run, saving output: `npx @astryxdesign/cli --help`, `--version`, `init --help`, `theme --help`, `component Theme`, `component AppShell`, `component TopNav`, `component Layout`, `component Heading`, `component Stack`, and `search <term> --type component` for any that fail. Also read https://astryx.atmeta.com/docs/cli for how Theme wraps the root and where the themes module lands.
- Done when: every component above resolved or has a recorded substitute.
- Tests: none (input gathering).
- Depends on: none.

### T2. Write docs/contracts/shell.md (S)
- Goal: the contract with sections 1 to 9 from section 4 of this plan.
- Changes: new `docs/contracts/shell.md` only.
- Done when: AC1 to AC4 and AC6 to AC8, AC10 hold; every specifier and prop appears verbatim in T1's output.
- Tests: the checks in section 7.
- Depends on: T1.

### T3. PR (S)
- Goal: mark this draft PR ready with the evidence.
- Changes: commit shell.md on `factory/3-shell-contract`; edit the PR body to keep `Closes #3` and add the CLI output from T1 in collapsible blocks.
- Done when: AC5 and AC9 hold (`git diff --name-only origin/main...HEAD` lists only `docs/contracts/shell.md`, `docs/specs/3-shell-contract.md`, `docs/plans/3-shell-contract.md`).
- Depends on: T2.

### Sequence
T1 → T2 → T3, serial. Total about half a day.

## 7. Test strategy

There is no code, so the checks are document checks the developer runs and reports as evidence:

| AC | Task | Check |
|---|---|---|
| AC1 | T2 | Diff the ownership table's T1.3/T1.5/T1.7 rows against BACKLOG.md section 4 (`grep` each path in both files) |
| AC2, AC8 | T2 | `grep -n "theme-neutral"` and the Theme specifier in shell.md; specifier matches `component Theme` output |
| AC3, AC10 | T2 | For each component row, the specifier and each prop are found verbatim in the saved CLI output (`grep -F`) |
| AC4 | T2 | All seven script names present |
| AC5 | T3 | `gh pr view --json body` contains `Closes #3` and the CLI output |
| AC6 | T2 | Read-through: setup list, theme, and "`src/main.tsx` → T1.5" are found without opening other files |
| AC7 | T2 | `grep -F` both import lines, in order |
| AC9 | T3 | `git diff --name-only origin/main...HEAD` |

Regression risk: none; no existing code.

## 8. Rollout and rollback

Documentation-only change: no migrations, configuration or runtime. **Feature flag: none.** The factory asks for every feature to ship behind a flag off by default, but this deliverable is a Markdown file that nothing executes, so there is nothing for a flag to gate; the flag requirement applies to the build tasks that ship runtime code. Rollback is reverting the PR.

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CLI unreachable from the developer's environment (planner's attempt was refused) | Medium | High: AC2, AC3, AC5, AC10 cannot be met without it | Complete the step as needs_human asking for CLI access; do not fill specifiers from memory |
| Catalog names differ from AppShell/TopNav/Layout/Heading/Stack | Medium | Medium | `search` and record substitution (AC10) |
| No frame component renders a banner or main landmark | Medium | Low | Contract says T1.7 provides the semantic element; T1.8 checks it |
| Issue's CSS paths differ from what the CLI documents | Low | Medium | Keep issue's lines (AC7), flag mismatch in shell.md and PR body |

## 10. Technical debt

None taken on.

## 11. Open questions

| # | Question | Who can answer | Blocks | Assumption made |
|---|---|---|---|---|
| Q1 | What is the app name shown in the header `h1`? The backlog never names it. | Product owner (repo owner) | No | "Todo"; shell.md states it so T1.7 and T1.8 agree |

## 12. Follow-ups

None.
