# Spec: #5 [T1.3] Build: scaffold Vite + React 19 + TS, Astryx init, test tooling

**Issue:** #5   **Plan:** [docs/plans/5-scaffold-vite-react-astryx.md](../plans/5-scaffold-vite-react-astryx.md)   **Contract:** [docs/contracts/shell.md](../contracts/shell.md)

## User story

As a build agent in a later wave (T1.5 theme wiring, T1.7 app frame, and every feature lane after them), I want the repo to already be a working Vite + React 19 + TypeScript app with the four Astryx packages installed, the Astryx agent docs and the theme-neutral themes module generated, and Vitest, Testing Library and Playwright configured, so that I can write source and tests without ever touching `package.json` or the tooling config.

## Scope

- **In:** running the setup commands of [shell.md section 1](../contracts/shell.md#1-setup-commands-in-order) in the repo root; the files T1.3 owns (`package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `README.md`, `src/vite-env.d.ts`, `src/test/setup.ts`, `playwright.config.ts`) and every file `npx @astryxdesign/cli init` or `theme` writes; the template's own files (`src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/App.css`, `src/assets/**`, `public/**`) committed exactly as the template wrote them.
- **Out:** hand-editing the template's source files (T1.5 and T1.7 own them), wiring `Theme` into the root (T1.5), the app frame (T1.7), any e2e test, any CI workflow change (`.github/**`), any theme other than theme-neutral, any package not named below.

## Acceptance criteria

AC1 to AC8 are the issue's `done_when`, AC9 to AC11 its Acceptance list, in its words. AC12 to AC15 restate its `must_not` as checkable criteria and are marked derived.

| ID | Criterion | Source |
|---|---|---|
| AC1 | One branch, one PR; body says `Closes #5`; the diff touches only owns. | issue, done_when |
| AC2 | package.json has react and react-dom 19, the four Astryx packages (`@astryxdesign/core`, `@stylexjs/stylex`, `@astryxdesign/theme-neutral`, `@astryxdesign/cli`), and devDependencies vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @playwright/test. | issue, done_when |
| AC3 | Scripts exist: dev, build, preview, typecheck, lint, test (`vitest run`), test:e2e (`playwright test`). | issue, done_when |
| AC4 | Vitest uses jsdom, setupFiles src/test/setup.ts (loads jest-dom matchers), passWithNoTests true, and excludes e2e/**. | issue, done_when |
| AC5 | playwright.config.ts: testDir e2e, webServer runs `npm run build && npm run preview`, projects Desktop Chrome and Pixel 7. | issue, done_when |
| AC6 | `npx @astryxdesign/cli doctor` reports no errors. | issue, done_when |
| AC7 | README lists every script, the themes module path, and `npx playwright install chromium`. | issue, done_when |
| AC8 | `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` exit 0 on the PR branch. | issue, done_when |
| AC9 | On a fresh clone, `npm ci && npm run build && npm test` succeed. | issue, Acceptance |
| AC10 | `npm run dev` serves a page (Vite template content is expected at this point). | issue, Acceptance |
| AC11 | The PR body lists every file the Astryx CLI wrote. | issue, Acceptance |
| AC12 | The theme-neutral themes module exists at `src/astryx-themes.ts` (the path shell.md fixes), and theme-neutral is the only theme recorded. | derived (Outcome, must_not) |
| AC13 | `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/App.css`, `src/assets/**` and `public/**` are byte-for-byte the template's (or the CLI's, listed in the PR body); nothing under `docs/**`, `.github/**` or `.factory/**` is changed or removed. | derived (must_not) |
| AC14 | No dependency beyond the template's own, the four Astryx packages and the six test packages in AC2 is added. | derived (must_not) |
| AC15 | Every `@astryxdesign/*` package is on the same release. | derived (shell.md section 1 notes) |
