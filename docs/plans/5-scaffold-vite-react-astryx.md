# Technical Plan: #5 [T1.3] Build: scaffold Vite + React 19 + TS, Astryx init, test tooling

**Ticket:** #5   **Spec:** [docs/specs/5-scaffold-vite-react-astryx.md](../specs/5-scaffold-vite-react-astryx.md)   **Contract:** [docs/contracts/shell.md](../contracts/shell.md)   **Status:** Draft

## 1. Summary

Scaffold the empty repo into a Vite + React 19 + TypeScript app by running the setup commands in [shell.md section 1](../contracts/shell.md#1-setup-commands-in-order) in order, then configure Vitest (jsdom, jest-dom setup) and Playwright (Desktop Chrome + Pixel 7 against a production preview), fix the npm script names from shell.md section 5, and write a README. The Vite template's app files are committed untouched; T1.5 and T1.7 own them next. After this PR no later task should need to change `package.json` or tooling config.

## 2. Requirements

### User story and acceptance criteria

See the spec: AC1 to AC11 from the issue, AC12 to AC15 derived.

### Non-functional requirements

- **Reproducible.** `package-lock.json` is committed; `npm ci` on a fresh clone works (AC9).
- **Same release.** All `@astryxdesign/*` packages resolve to one release (shell.md section 1 notes). The contract was written against 0.7.16; if npm installs a newer release, record the installed version in the PR body.
- **Deterministic docs.** The README and PR body name exact paths, not "the themes file".

### Out of scope

Editing `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/App.css`, `src/assets/**`, `public/**` (T1.5, T1.7); writing tests or e2e specs; CI workflow changes (`.github/**` is not owned); any extra package (e.g. `@vitest/ui`, prettier, coverage tools).

### Assumptions

- A1. The developer has network access to npm and can run `npx @astryxdesign/cli ...` in the repo. The planner ran none of the commands in this session; the facts below about what the CLI writes come from shell.md, which pasted CLI 0.7.16 output.
- A2. `npm create vite@latest` currently produces React 19 and a `tsc -b && vite build` build script with `tsconfig.app.json` / `tsconfig.node.json` project references. If it produces older React, upgrade `react`, `react-dom`, `@types/react`, `@types/react-dom` to 19 (shell.md section 1 notes); that is not "an extra package".
- A3. The template's `README.md` and `.gitignore` are T1.3's to rewrite/extend (both are in owns).

## 3. Current state

Verified on `origin/main` at `0d993bf`: the repo holds only `.factory/workflow.yaml`, `.github/workflows/spike-ci.yml` (an `echo` placeholder check), `docs/backlog/**`, `docs/contracts/shell.md`, and the specs/plans for #3. There is no `package.json`, no `src/`, no `.gitignore`. The directory is therefore **non-empty** for the Vite scaffolder (shell.md section 1, step 1: choose *ignore existing files*).

## 4. Proposed design

### Changes by file

| File | Change | Writer |
|---|---|---|
| `package.json`, `package-lock.json` | Template, plus the four Astryx deps and six test devDeps; scripts per shell.md section 5 | template + npm + hand edit (scripts) |
| `index.html` | Template as written (may set `<title>` to `Todo`; optional) | template |
| `vite.config.ts` | Template plus a `test` block (below) | template + hand edit |
| `tsconfig.json`, `tsconfig.node.json` | Template | template |
| `tsconfig.app.json` | Template plus `"types": ["vite/client", "@testing-library/jest-dom"]` (or equivalent) so matchers type-check in `src/**/*.test.tsx`, and exclude nothing T1.7 needs | template + hand edit |
| `eslint.config.js` | Template; add `playwright-report`, `test-results` to `globalIgnores` | template + hand edit |
| `.gitignore` | Template plus `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/` | template + hand edit |
| `README.md` | Rewritten (below) | hand |
| `src/vite-env.d.ts` | Template (only if the current template still writes it; otherwise do not create one unless typecheck needs it) | template |
| `src/test/setup.ts` | `import '@testing-library/jest-dom/vitest';` | hand, new |
| `playwright.config.ts` | New (below) | hand, new |
| `AGENTS.md`, `CLAUDE.md` or `.claude/CLAUDE.md`, `GEMINI.md` | Written by `npx @astryxdesign/cli init`; commit as written | CLI |
| `src/astryx-themes.ts` (+ any config the `theme` command writes, e.g. `astryx.config.*`) | Written by `npx @astryxdesign/cli theme add neutral`; commit as written | CLI |
| `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/App.css`, `src/assets/react.svg`, `public/vite.svg` | Template output, **never hand-edited** | template |

### Contracts

**Scripts** (shell.md section 5, names fixed):

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

**Vitest** — in `vite.config.ts` (no separate `vitest.config.ts`: it is not in owns). Use `defineConfig` from `vitest/config` (or `/// <reference types="vitest/config" />` with Vite's `defineConfig`) so the `test` key type-checks:

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['src/test/setup.ts'],
  passWithNoTests: true,
  exclude: [...configDefaults.exclude, 'e2e/**'],
}
```

Keep Vitest's default excludes (`node_modules`, `dist`, …) by spreading `configDefaults.exclude`.

**Playwright** — `playwright.config.ts`:

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

4173 is `vite preview`'s default port. `e2e/` itself is not created (not owned); `playwright test` with no tests is not part of any done_when.

**README** sections: what the app is (one line), prerequisites (Node version the template needs), setup (`npm ci`, `npx playwright install chromium`), a table of all seven scripts, the themes module path `src/astryx-themes.ts` and the rule that app code imports the theme only through it, and the Astryx CLI commands (`npx @astryxdesign/cli doctor`, `component <Name>`).

### Edge cases

- **Non-empty directory prompt:** choose *Ignore files and continue*. Never *Remove existing files*. After scaffolding, `git status` must show no change under `docs/`, `.github/`, `.factory/` (AC14).
- **Scaffolder offers to install and start the dev server** (newer create-vite asks): decline starting the server; installing is fine.
- **`init` or `theme` rewrites a template file** (e.g. `src/main.tsx`): keep it, list it in the PR body (AC13).
- **`init` writes `.claude/CLAUDE.md` vs `CLAUDE.md`:** whichever it writes is owned; list it.
- **`doctor` warns but does not fail:** warnings are acceptable (AC6 says "no errors"); paste its output in the PR body.
- **ESLint on `playwright.config.ts`/`vite.config.ts`:** these are covered by `tsconfig.node.json`'s `include`; add `playwright.config.ts` to it if typecheck/lint complain.

## 5. Key decisions

| Decision | Choice | Rationale | Alternatives rejected |
|---|---|---|---|
| Where Vitest config lives | `test` block in `vite.config.ts` | `vite.config.ts` is owned; `vitest.config.ts` is not | separate `vitest.config.ts` (outside owns) |
| jest-dom import | `@testing-library/jest-dom/vitest` | registers matchers on Vitest's `expect` and their types | plain `@testing-library/jest-dom` (needs global `expect`) |
| Theme generation | `npx @astryxdesign/cli theme add neutral` after `init` | shell.md section 1: `init` writes no themes module in 0.7.16 | hand-writing a themes module (forbidden) |
| Preview port | 4173 default | no extra config needed | custom port |
| `typecheck` command | `tsc -b` | matches build's type step; shell.md section 5 | `tsc --noEmit` (doesn't follow project references) |

No significant (ADR-level) decisions.

## 6. Implementation tasks

### T1. Scaffold and install (S)
- Goal: template + all packages installed and locked.
- Changes: run shell.md section 1 steps 1–3 in the repo root.
- Done when: `package.json` has react/react-dom ^19, the four Astryx deps, the six devDeps (AC2, AC15); `git status` shows nothing changed under `docs/`, `.github/`, `.factory/` (AC14).
- Tests: `npm ls react react-dom @astryxdesign/core @astryxdesign/theme-neutral` resolves.
- Depends on: none.

### T2. Astryx init and theme (S)
- Goal: agent docs and the themes module generated; doctor clean.
- Changes: run steps 4–6 (`init`, `theme add neutral`, `doctor`). Record every path created or modified (`git status --porcelain` before/after each command) for the PR body.
- Done when: `src/astryx-themes.ts` exists and exports `themes` and `defaultThemeSlug` with `neutral` as default (AC12); `doctor` exits 0 (AC6).
- Depends on: T1.

### T3. Scripts, Vitest, Playwright, lint/ignore config (S)
- Goal: tooling per section 4 contracts.
- Changes: `package.json` scripts, `vite.config.ts`, `tsconfig.app.json` (jest-dom types), `tsconfig.node.json` (include `playwright.config.ts` if needed), `src/test/setup.ts`, `playwright.config.ts`, `eslint.config.js`, `.gitignore`.
- Done when: AC3, AC4, AC5 hold by inspection; `npm run typecheck`, `npm run lint`, `npm test` (passes with no tests), `npm run build` exit 0 (AC8).
- Depends on: T2.

### T4. README and PR (S)
- Goal: docs and the hand-off.
- Changes: `README.md`; mark the draft PR ready.
- Done when: README meets AC7; on a fresh clone into a temp dir, `npm ci && npm run build && npm test` succeed (AC9); `npm run dev` answers HTTP 200 on `/` (AC10); PR body says `Closes #5`, lists every CLI-written file and any template file the CLI changed, pastes `doctor` output and the installed Astryx version (AC1, AC11, AC13); `git diff --name-only origin/main` lists only owned paths plus this spec and plan (AC1).
- Depends on: T3.

### Sequence
Strictly serial T1 → T2 → T3 → T4; total about 1–1.5 days (4 × S).

## 7. Test strategy

This task adds no app logic, so there are no unit tests to write; verification is command-based, and the evidence (command + exit code + tail of output) goes in the PR.

| AC | Tasks | Check |
|---|---|---|
| AC1, AC14 | T1, T4 | `git diff --name-only origin/main...HEAD` ⊆ owns ∪ {spec, plan} |
| AC2, AC15 | T1 | inspect `package.json` deps; `npm ls` |
| AC3 | T3 | `npm run` lists the seven scripts with the fixed commands |
| AC4 | T3 | inspect `vite.config.ts`, `src/test/setup.ts`; `npm test` exits 0 with "No test files found" pass |
| AC5 | T3 | inspect `playwright.config.ts`; `npx playwright test --list` loads the config without error |
| AC6 | T2 | `npx @astryxdesign/cli doctor; echo $?` → 0 |
| AC7 | T4 | README read-through against the list |
| AC8 | T3 | the four commands, exit codes |
| AC9 | T4 | fresh `git clone` into a temp dir, `npm ci && npm run build && npm test` |
| AC10 | T4 | `npm run dev` then `curl -sf http://localhost:5173/` |
| AC11, AC13 | T2, T4 | before/after `git status` per CLI command matches PR list; `git diff` on template app files is empty except listed CLI changes |
| AC12 | T2 | `src/astryx-themes.ts` imports theme-neutral only; `defaultThemeSlug === 'neutral'` |

Regression risk: none in app code (there is none yet). Risk to later tasks: a wrong Vitest/TS types setup would break T1.7's `App.test.tsx`; mitigate by confirming in T3 that a throwaway `src/__probe.test.tsx` using `toBeInTheDocument()` passes typecheck and test — then delete it (do not commit).

## 8. Rollout and rollback

**Feature flag:** none. This PR ships tooling and the untouched Vite template, with no user-facing feature to gate, and the flag's natural homes (`src/main.tsx`, app code, `.env`) are outside T1.3's owns. The first user-visible behavior (T1.7's frame, wave-1 task features) is where a flag belongs; recorded as open question Q1. No migrations, no infra, no deployment exists yet. Rollback: revert the merge commit; nothing depends on it until T1.5 starts.

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Newer `@astryxdesign/*` release than the contract's 0.7.16 changes what `init`/`theme` write | Med | Med | Record installed version; if files differ from shell.md, list them and flag in PR for T1.4 |
| Scaffolder removes or overwrites `docs/**` | Low | High | Choose *ignore*; check `git status` before committing |
| `@stylexjs/stylex` needs a Vite plugin for Core to build | Low | Med | shell.md / CLI install docs name no plugin; if `npm run build` fails for this reason, stop, label `blocked`, and hand back (adding a plugin package violates AC15) |
| create-vite template drift (e.g. no `src/vite-env.d.ts`, different eslint config) | Med | Low | Follow what the template writes; do not invent owned files it no longer creates |
| Playwright browsers unavailable in CI | Med | Low | `test:e2e` is not in AC8; README documents `npx playwright install chromium` |

## 10. Technical debt

- `.github/workflows/spike-ci.yml` is still an `echo` placeholder, so CI does not run typecheck/lint/test. Out of scope (not owned); follow-up below.

## 11. Open questions

| # | Question | Who can answer | Blocks | Assumption made |
|---|---|---|---|---|
| Q1 | Where should feature flags live once app behavior exists (env var `VITE_FF_*` read in app code, or a config file)? | Product owner / architect | None here | No flag in this PR; decide before T1.7 / wave 1 |
| Q2 | Should `index.html`'s `<title>` become `Todo` (shell.md app name) now? | Product owner | None | Optional; leave template title unless trivially aligned |

## 12. Follow-ups

- Replace `spike-ci.yml` with a real CI job running `npm ci`, `typecheck`, `lint`, `test`, `build` (tooling task in the backlog).
- Decide the feature-flag mechanism (Q1).
