# Spec: #5 [T1.3] Build: scaffold Vite + React 19 + TS, Astryx init, test tooling

**Issue:** #5   **Plan:** [docs/plans/5-scaffold-vite-react-astryx.md](../plans/5-scaffold-vite-react-astryx.md)   **Contract:** [docs/contracts/shell.md](../contracts/shell.md)

## User story

As a build agent in wave 0 and later waves (T1.5 theme wiring, T1.7 app frame, the task-screen lanes), I want the repo scaffolded once as a Vite + React 19 + TypeScript app with the four Astryx packages installed, the Astryx CLI's `init` and `theme add neutral` applied, and Vitest, Testing Library and Playwright configured, so that I can write and test my own files without ever touching `package.json` or tooling config.

## Scope

- **In:** the files T1.3 owns (shell.md section 6): `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `README.md`, `src/vite-env.d.ts`, `src/test/setup.ts`, `playwright.config.ts`, and every file `npx @astryxdesign/cli init` or `theme` writes (for 0.7.16: `AGENTS.md`, `CLAUDE.md` or `.claude/CLAUDE.md`, `GEMINI.md`, `src/astryx-themes.ts`). Also the Vite template's own `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/App.css`, `src/assets/react.svg`, `public/vite.svg`, committed **exactly as the template wrote them** (shell.md section 6).
- **Out:** wiring Theme into `src/main.tsx` or changing `src/index.css` (T1.5); the app frame and deleting template assets (T1.7); any feature behavior; any `e2e/**` test; any package not named below; any theme but theme-neutral; any change to `docs/**`, `.github/**`, `.factory/**`.

## Acceptance criteria

AC1 to AC8 are the issue's `done_when`, AC9 to AC11 its Acceptance items, in its words. AC12 to AC15 restate its `must_not` as checkable criteria and are marked derived.

| ID | Criterion | Source |
|---|---|---|
| AC1 | One branch, one PR; body says `Closes #5`; the diff touches only owns. | issue, done_when |
| AC2 | package.json has react and react-dom 19, the four Astryx packages (`@astryxdesign/core`, `@stylexjs/stylex`, `@astryxdesign/theme-neutral`, `@astryxdesign/cli`), and devDependencies vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @playwright/test. | issue, done_when |
| AC3 | Scripts exist: dev, build, preview, typecheck, lint, test (`vitest run`), test:e2e (`playwright test`). | issue, done_when |
| AC4 | Vitest uses jsdom, setupFiles src/test/setup.ts (loads jest-dom matchers), passWithNoTests true, and excludes e2e/**. | issue, done_when |
| AC5 | playwright.config.ts: testDir e2e, webServer runs `npm run build && npm run preview`, projects Desktop Chrome and Pixel 7. | issue, done_when |
| AC6 | `npx @astryxdesign/cli doctor` reports no errors. | issue, done_when |
| AC7 | README lists every script, the themes module path (`src/astryx-themes.ts`), and `npx playwright install chromium`. | issue, done_when |
| AC8 | `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` exit 0 on the PR branch. | issue, done_when |
| AC9 | On a fresh clone, `npm ci && npm run build && npm test` succeed. | issue, Acceptance |
| AC10 | `npm run dev` serves a page (Vite template content is expected at this point). | issue, Acceptance |
| AC11 | The PR body lists every file the Astryx CLI wrote. | issue, Acceptance |
| AC12 | theme-neutral is available through the generated themes module `src/astryx-themes.ts`, and it is the only theme recorded. | derived (Outcome, must_not) |
| AC13 | `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/App.css`, `src/assets/**`, `public/**` are byte-for-byte the template's output, except changes the Astryx CLI itself made, each listed in the PR body. | derived (must_not) |
| AC14 | No file under `docs/**`, `.github/**` or `.factory/**` is changed or deleted. | derived (must_not) |
| AC15 | No dependency beyond the template's own, the four Astryx packages and the six test devDependencies is added (React types upgraded to 19 only if the template ships older ones). | derived (must_not) |
