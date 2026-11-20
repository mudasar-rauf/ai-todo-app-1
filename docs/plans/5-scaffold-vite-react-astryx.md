# Technical Plan: #5 [T1.3] Build: scaffold Vite + React 19 + TS, Astryx init, test tooling

**Ticket:** #5   **Spec:** [docs/specs/5-scaffold-vite-react-astryx.md](../specs/5-scaffold-vite-react-astryx.md)   **Contract:** [docs/contracts/shell.md](../contracts/shell.md)   **Status:** Draft

## 1. Summary

Turn the docs-only repo into a Vite + React 19 + TypeScript app by running the setup commands of shell.md section 1, in order, in the repo root: the Vite `react-ts` template, the four Astryx packages, the six test packages, `astryx init` (agent docs), `astryx theme add neutral` (themes module `src/astryx-themes.ts`), and `astryx doctor`. Then configure Vitest inside `vite.config.ts`, add `src/test/setup.ts` and `playwright.config.ts`, add the `typecheck`/`test`/`test:e2e` scripts, and rewrite the README. The template's source files are committed untouched. One PR, all S/M work, no runtime behaviour, so no feature flag (section 8).

## 2. Requirements

### User story and acceptance criteria

See the spec: AC1 to AC11 come from the issue, AC12 to AC15 are derived from its must_not and the shell contract.

### Non-functional requirements

- **Reproducible install.** `package-lock.json` is committed; `npm ci` on a fresh clone with Node 22 works (AC9).
- **Strict ownership.** Only T1.3's owns plus CLI-written files appear in the diff (AC1, AC13).
- **No later task touches package.json** (issue Outcome): every script and dev dependency later lanes need is here now.

### Out of scope

Wiring `Theme` into `src/main.tsx` and replacing `src/index.css` (T1.5); `src/App.tsx` frame and deleting the template assets (T1.7); any `e2e/*.spec.ts` (later lanes); replacing `.github/workflows/spike-ci.yml` with real CI (not in owns; follow-up).

### Assumptions

- A1. **Not verified by the planner.** In the planning sandbox both `npm create vite@latest` and `npx @astryxdesign/cli --help` failed with exit 126 (binaries not executable there). So every statement below about what the template or the CLI writes comes from `docs/contracts/shell.md` (CLI 0.7.16, Core 0.7.16) and general knowledge of create-vite. The developer must check each one against what actually happens and list the actual files in the PR body.
- A2. The current create-vite `react-ts` template installs React 19 and `@types/react` 19. If it does not, upgrade `react`, `react-dom`, `@types/react`, `@types/react-dom` to 19 (shell.md section 1 notes).
- A3. Node 22 (the factory container has v22.23.5) satisfies Vite's engine range.
- A4. Tests import `describe`/`it`/`expect` from `vitest` explicitly; Vitest `globals` stays off, so no `vitest/globals` types are needed.

## 3. Current state

Verified at `0d993bf` (main):

- The repo holds only `docs/` (backlog, `contracts/shell.md`, specs and plans for #3), `.github/workflows/spike-ci.yml` (an echo-only check) and `.factory/workflow.yaml`. No `package.json`, no `src/`, no `README.md`, no `.gitignore`, no `CLAUDE.md`/`AGENTS.md`.
- `docs/contracts/shell.md` fixes: the setup commands and their order (section 1), the themes module path `src/astryx-themes.ts` (sections 1–2), script names and commands (section 5), Vitest and Playwright settings (section 5), and T1.3's owns (section 6), including that template files are committed as written.

## 4. Proposed design

### Overview

```
npm create vite (react-ts)  ──> template files (committed as-is)
npm install (4 Astryx pkgs) ─┐
npm install -D (6 test pkgs) ┴─> package.json / package-lock.json
astryx init                 ──> AGENTS.md, CLAUDE.md, GEMINI.md (agent docs)
astryx theme add neutral    ──> src/astryx-themes.ts (+ any config file it writes)
astryx doctor               ──> must exit 0
hand-written config         ──> vite.config.ts (test block), src/test/setup.ts,
                                playwright.config.ts, scripts, .gitignore,
                                eslint ignores, tsconfig.node.json include, README.md
```

### Changes by component

| File | Change | New or modified |
|---|---|---|
| Template files (`index.html`, `tsconfig*.json`, `eslint.config.js`, `.gitignore`, `src/**`, `public/**`, `README.md`) | Written by create-vite | New |
| `package.json` | Template + deps from commands 2–3; scripts `typecheck`, `test`, `test:e2e` added; template scripts kept | New |
| `package-lock.json` | From npm | New |
| `vite.config.ts` | Add Vitest `test` block | Template, modified |
| `src/test/setup.ts` | Loads jest-dom matchers for Vitest | New |
| `playwright.config.ts` | Playwright config | New |
| `tsconfig.node.json` | Add `playwright.config.ts` to `include` so `tsc -b` typechecks it | Template, modified |
| `eslint.config.js` | Add `playwright-report`, `test-results` (and, only if needed, CLI-generated files) to the global ignores | Template, modified |
| `.gitignore` | Add `playwright-report/`, `test-results/`, `blob-report/`, `playwright/.cache/` | Template, modified |
| `README.md` | Rewritten: setup, every script, themes module path, `npx playwright install chromium` | Template, replaced |
| `AGENTS.md`, `CLAUDE.md` (or `.claude/CLAUDE.md`), `GEMINI.md`, `src/astryx-themes.ts`, and anything else the CLI writes | Generated by `init` / `theme add neutral`; never hand-edited | New |

### Contracts

**Scripts** (shell.md section 5; names fixed):

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc -b",
  "lint": "eslint .",
  "test": "vitest run",
  "test:e2e": "playwright test"
}
```

**Vitest**, inside `vite.config.ts` (one config file, no separate `vitest.config.ts`, which is not in owns):

```ts
/// <reference types="vitest/config" />
import {defineConfig, configDefaults} from 'vitest/config'; // or keep vite's defineConfig with the reference above
// plugins: keep the template's react() plugin unchanged
test: {
  environment: 'jsdom',
  setupFiles: ['src/test/setup.ts'],
  passWithNoTests: true,
  exclude: [...configDefaults.exclude, 'e2e/**'],
}
```

**`src/test/setup.ts`:** `import '@testing-library/jest-dom/vitest';` (registers the matchers and their types with Vitest's `expect`).

**`playwright.config.ts`:**

```ts
import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  use: {baseURL: 'http://localhost:4173'},
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {name: 'Desktop Chrome', use: {...devices['Desktop Chrome']}},
    {name: 'Pixel 7', use: {...devices['Pixel 7']}},
  ],
});
```

Both projects run on Chromium, so `npx playwright install chromium` is the only browser install the README needs. 4173 is `vite preview`'s default port.

### Error handling and edge cases

- **Non-empty directory.** create-vite will see `docs/`, `.github/`, `.factory/`. Choose **Ignore files and continue**; never "remove existing files". If the prompt can't be answered in the container (non-interactive), scaffold into a scratch directory outside the repo with the same command and copy its files into the repo root without overwriting anything. Either way, `git status` must show no change under `docs/`, `.github/`, `.factory/` before committing.
- **Template has no `src/vite-env.d.ts`.** Newer templates put `"types": ["vite/client"]` in `tsconfig.app.json` instead. Do not create the file then; it is owned, not required.
- **CLI rewrites a template file** (for example `src/main.tsx`). Keep the change and list it in the PR body (issue must_not).
- **CLI-generated file fails lint or typecheck.** Do not edit it. Add it to `eslint.config.js` global ignores (lint) or report it in the PR body and stop with label `blocked` (typecheck), per the issue's must_not.
- **`doctor` reports a failure.** Fix it only within owns (for example version alignment of `@astryxdesign/*`); if the fix needs a path outside owns, label `blocked` and comment.
- **`npm run test:e2e` with no `e2e/` folder** exits non-zero ("No tests found"). That is expected now and is not in the done_when; say so in the README and the PR body.

## 5. Key decisions

| Decision | Choice | Rationale | Alternatives rejected |
|---|---|---|---|
| Where Vitest config lives | `test` block in `vite.config.ts` | Owned file; shares the React plugin; no extra file | `vitest.config.ts` (not in owns) |
| jest-dom loading | `@testing-library/jest-dom/vitest` entry | Registers matchers and augments Vitest's types in one import | `expect.extend(matchers)` by hand (more code, separate types) |
| Typecheck of `playwright.config.ts` | Add it to `tsconfig.node.json` `include` | `npm run typecheck` then covers every TS config file | Leave it unchecked |
| Themes module | `npx @astryxdesign/cli theme add neutral` | shell.md: `init` writes no themes module; `theme add` writes `src/astryx-themes.ts` | Hand-written module (forbidden) |
| Package versions | Whatever `npm install` resolves today, with every `@astryxdesign/*` on one release | Issue names packages, not versions; Astryx themes pin a Core release | Hand-pinning versions |

No decision here is significant enough for an ADR.

## 6. Implementation tasks

### T1. Scaffold and install (M)
- Goal: template, Astryx packages and test packages in place.
- Changes: shell.md section 1 commands 1–3 in the repo root.
- Details: see "Non-empty directory" above. Check `react`/`react-dom` are `^19` (A2). Check every `@astryxdesign/*` resolves to one release (AC15).
- Done when: AC2, AC14, AC15; `git status` shows nothing changed under `docs/`, `.github/`, `.factory/`.
- Tests: `npm run build` and `npm run lint` pass on the untouched template.
- Depends on: none.

### T2. Astryx init, theme, doctor (S)
- Goal: agent docs and `src/astryx-themes.ts` with theme-neutral.
- Changes: commands 4–6 (`npx @astryxdesign/cli init`, `npx @astryxdesign/cli theme add neutral`, `npx @astryxdesign/cli doctor`).
- Details: before and after each command, record `git status --porcelain` so the PR body can list every file the CLI wrote or changed (AC11). Do not hand-edit any of them.
- Done when: AC6, AC12; the file list is captured.
- Tests: `doctor` exit code 0; `npm run typecheck` still passes with the themes module in `src/`.
- Depends on: T1.

### T3. Test tooling config (S)
- Goal: Vitest and Playwright configured as in section 4.
- Changes: `vite.config.ts`, `src/test/setup.ts`, `playwright.config.ts`, `tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `package.json` scripts.
- Done when: AC3, AC4, AC5; `npm test` exits 0 with no tests.
- Tests: during development only, drop a throwaway `src/smoke.test.tsx` rendering `<App />` and asserting with `toBeInTheDocument()` to prove jsdom and jest-dom work, then **delete it before committing** (`src/*.test.tsx` beyond owns would break AC1). Optionally run a throwaway `e2e/smoke.spec.ts` once against the preview server, also not committed.
- Depends on: T1.

### T4. README, verification, PR (S)
- Goal: README and the PR ready for review.
- Changes: `README.md`.
- Details: README lists every script from section 4 with one-line purposes, the themes module path `src/astryx-themes.ts` (and that app code imports the theme only from there), the setup step `npx playwright install chromium`, and the Node version. Run, on the branch: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; then in a fresh clone `npm ci && npm run build && npm test`; then `npm run dev` and fetch the page (AC10). Paste outputs as evidence.
- PR body: `Closes #5`; the list of every file the Astryx CLI wrote or changed (from T2); any template file the CLI rewrote; note that `test:e2e` has no specs yet.
- Done when: AC1, AC7, AC8, AC9, AC10, AC11, AC13.
- Depends on: T2, T3.

### Sequence

T1 → (T2 ∥ T3) → T4. All on the branch `factory/5-scaffold-vite-react-astryx` and the draft PR this plan opens. Total about 1.5 days of work at the top of each size, realistically less.

## 7. Test strategy

| Acceptance criterion | Tasks | Test type | What verifies it |
|---|---|---|---|
| AC1, AC13 | T1, T4 | Review | `git diff --stat main...` lists only owns and CLI files; `git diff main -- docs .github .factory` empty; template src files match a fresh create-vite output |
| AC2, AC14, AC15 | T1 | Inspection | `package.json` deps; `npm ls @astryxdesign/core @astryxdesign/theme-neutral @astryxdesign/cli` one version |
| AC3 | T3 | Inspection | `npm run` lists the seven scripts with the fixed commands |
| AC4 | T3 | Tool run | `npm test` exits 0 with no tests; throwaway smoke test passes with `toBeInTheDocument` |
| AC5 | T3 | Inspection, optional run | Config values; optional throwaway e2e run |
| AC6, AC12 | T2 | Tool run | `npx @astryxdesign/cli doctor` exit 0; `src/astryx-themes.ts` exists and names only neutral |
| AC7 | T4 | Inspection | README content |
| AC8 | T4 | Tool run | Four commands exit 0 |
| AC9 | T4 | Tool run | Fresh clone `npm ci && npm run build && npm test` |
| AC10 | T4 | Tool run | `npm run dev`, `curl` the served page returns the template HTML |
| AC11 | T2, T4 | Review | PR body list matches `git status` captured around each CLI command |

Regression risk: none in app code (there is none yet). The spike-ci check keeps passing; it does not run npm.

## 8. Rollout and rollback

No feature flag: this story adds build tooling and the unmodified Vite template, with no user-facing behaviour to switch on or off. The first behaviour (the theme and the frame) arrives in T1.5 and T1.7. Rollback is reverting the merge commit. No migrations, no configuration or infrastructure changes.

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| create-vite refuses or wipes a non-empty directory | Medium | High (docs lost) | Choose "ignore"; else scaffold in a scratch dir and copy; check `git status` before committing |
| CLI writes files or names different from shell.md (A1) | Medium | Medium | Capture `git status` around each command; list actual files; if the themes module is not `src/astryx-themes.ts`, label `blocked` and comment: shell.md and T1.5 depend on that path |
| Template installs React 18 | Low | Medium | Upgrade to 19 (A2) |
| Generated files fail `eslint .` | Medium | Low | Ignore them in `eslint.config.js`, never edit them |
| `@astryxdesign/*` versions drift apart | Low | Medium | `doctor` plus `npm ls` check (AC15) |

## 10. Technical debt

- Taken on: `.github/workflows/spike-ci.yml` still only echoes; it does not run typecheck/lint/test/build (infrastructure debt). Follow-up below.

## 11. Open questions

| # | Question | Who can answer | Blocks | Assumption made |
|---|---|---|---|---|
| Q1 | Should `npm run test:e2e` pass with no specs (e.g. `--pass-with-no-tests`)? | Product owner / backlog author | None | No: the issue fixes the command as `playwright test`; documented as expected to fail until the first e2e spec lands |

## 12. Follow-ups

- Replace `spike-ci.yml` with CI running `npm ci`, typecheck, lint, test, build (needs an owner for `.github/**`).
