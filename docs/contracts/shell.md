# Shell contract

**Owner:** T1.1 (#3). **Readers:** T1.3 (scaffold), T1.5 (theme and global CSS), T1.7 (app frame), their reviews T1.4, T1.6 and T1.8, and T2.1, which reads it for `TaskScreen`.

This file settles the app shell before any code exists: the setup commands, the theme, the global CSS, how Theme wraps the root, which Astryx components build the frame, the npm script names, and which task owns which file. Every Astryx name, import specifier and prop below was printed by the Astryx CLI, **`@astryxdesign/cli` 0.7.16 with Core 0.7.16** (run outside the repo, on 2026-11-20). The PR that added this file pastes that output. Background: [docs/backlog/BACKLOG.md](../backlog/BACKLOG.md); this file does not depend on it for any fact below.

## 1. Setup commands, in order

T1.3 runs these, in the repo root, in this order. T1.1 ran none of them in the repo.

| # | Command | What it does | Source |
|---|---|---|---|
| 1 | `npm create vite@latest . -- --template react-ts` | Vite + React + TypeScript template. If it reports a non-empty directory, choose **ignore existing files**. Never remove `docs/**`, `.github/**` or `.factory/**`. | T1.3 inputs |
| 2 | `npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli` | The four Astryx packages, the same command the CLI's `docs getting-started install` prints. Also installs the template's own dependencies. | T1.3 inputs |
| 3 | `npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test` | Test tooling | Derived from T1.3 done_when |
| 4 | `npx @astryxdesign/cli init` | Writes the agent docs only: the managed block in `AGENTS.md` and in the project's Claude Code file (`CLAUDE.md`, else `.claude/CLAUDE.md`), and a one-line import of `AGENTS.md` in `GEMINI.md`. It writes **no themes module** (`docs cli/commands/init`). Non-interactive; run it with no flags. | T1.3 inputs |
| 5 | `npx @astryxdesign/cli theme add neutral` | Records theme-neutral and generates the themes module **`src/astryx-themes.ts`**, which imports the theme's built module, production CSS and font CSS. The first theme added becomes the default (`docs use-a-theme quick-start`). | T1.3 inputs ("if `init` does not produce a themes module, `theme`") |
| 6 | `npx @astryxdesign/cli doctor` | Must report no failed checks (exit 0) | T1.3 inputs |
| 7 | `npx playwright install chromium` | Downloads the browser for `test:e2e`. Local only: it writes nothing to the repo. README lists it. | Derived from T1.3 done_when (README) |

Notes:

- `@astryxdesign/core` needs React 19 or later: `react` and `react-dom` >= 19.0.0 are its peer dependencies (`docs getting-started install`). If the template installs an older React, T1.3 upgrades `react`, `react-dom` and their types to 19.
- Every file that steps 4 and 5 write (`AGENTS.md`, `CLAUDE.md` or `.claude/CLAUDE.md`, `GEMINI.md`, `src/astryx-themes.ts`, plus any other file they write) belongs to T1.3, which lists each one in its PR body.
- Keep every `@astryxdesign/*` package on the same release: each theme names the exact Core release it works with (`docs getting-started upgrade`).

## 2. Theme

- **Theme:** theme-neutral, package **`@astryxdesign/theme-neutral`**, slug `neutral`. No other theme.
- **Where it comes from:** only the generated themes module **`src/astryx-themes.ts`** (step 5). Never import `@astryxdesign/theme-neutral` directly in app code.
- **Theme component:** `import {Theme} from '@astryxdesign/core/theme';`
- **Props used:** `theme` (required, `DefinedTheme`), given `themes[defaultThemeSlug]`; `children` (required). `mode` is left at its default, `'system'`.

### How Theme wraps the root

`src/main.tsx` (owned by **T1.5**) renders `StrictMode > Theme (theme-neutral) > App`, wired as the CLI's `docs use-a-theme quick-start` and `docs getting-started add-base-css-and-a-theme` print it:

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Theme} from '@astryxdesign/core/theme';
import {themes, defaultThemeSlug} from './astryx-themes';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme theme={themes[defaultThemeSlug]}>
      <App />
    </Theme>
  </StrictMode>,
);
```

`App` stays the template's default export from `./App`.

## 3. Global CSS

`src/index.css` (owned by **T1.5**) contains exactly these two lines, in this order, and nothing else:

```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
```

`src/main.tsx` imports `./index.css`. These are the same two lines the CLI prints for `globals.css` in `docs getting-started add-base-css-and-a-theme`. `reset.css` loads in `@layer reset` and `astryx.css` in `@layer astryx-base`. The theme's own CSS comes in through `src/astryx-themes.ts`, not through `index.css`. No other CSS file exists in the app (T1.7 deletes `src/App.css`).

## 4. Frame components

All five catalog names resolved with `npx @astryxdesign/cli component <Name>`; there were no substitutions. One sub-component was also read: `TopNavHeading`.

| Component | Import specifier | Props the frame uses | Role in the frame |
|---|---|---|---|
| AppShell | `import {AppShell} from '@astryxdesign/core/AppShell';` | `topNav` (ReactNode), `height` (`'auto'`), `contentPadding` (`4`), `children` (ReactNode) | Page shell. It renders the skip link, the **banner landmark** and the **main landmark**; `children` render inside `<main>`. |
| TopNav | `import {TopNav} from '@astryxdesign/core/TopNav';` | `heading` (ReactNode), `label` (string) | Header bar in AppShell's `topNav` slot. Renders a `<nav>` named by `label`. |
| Heading | `import {Heading} from '@astryxdesign/core/Heading';` | `level` (`1`), `children` | The single `h1`: the app name. `level` sets the element (h1 to h6). |
| Layout | `import {Layout} from '@astryxdesign/core/Layout';` | `contentWidth` (`640`), `height` (`'auto'`), `children` | Centres and caps the width of the content inside main. |
| Stack | `import {Stack} from '@astryxdesign/core/Stack';` | none in the frame | Confirmed for later lanes (`direction`, `gap`, …); the frame does not use it. |
| TopNavHeading | `import {TopNavHeading} from '@astryxdesign/core/TopNav';` | none: **not used** | Its `heading` prop is a `string`, and the CLI does not say which element it renders, so it can't be shown to give an `h1`. Use `Heading` instead. |

### Frame shape (T1.7, `src/App.tsx`)

- **App name:** `Todo` (the backlog never names the app; plan Q1. A person can change it here, and T1.7 and T1.8 follow).
- **Banner landmark:** comes from AppShell. AppShell's anatomy puts the `banner` slot "inside the banner landmark", above the top nav, and says AppShell "owns the skip link, the banner landmark and the main landmark". The banner holds TopNav, whose `heading` slot holds `<Heading level={1}>Todo</Heading>`. That is the page's only `h1`.
- **Main landmark:** also from AppShell: `children` render inside `<main>`. Main renders only `<Layout>` with `<TaskScreen />` in it. Do not add another `<main>` or skip link (the AppShell docs say so).
- **TaskScreen:** comes from `src/tasks/TaskScreen.tsx` (stub from T2.1, owned by T2.3). Its export form is set by `docs/contracts/tasks.md`.

```tsx
<AppShell
  height="auto"
  contentPadding={4}
  topNav={<TopNav label="Todo" heading={<Heading level={1}>Todo</Heading>} />}>
  <Layout height="auto" contentWidth={640}>
    <TaskScreen />
  </Layout>
</AppShell>
```

Why these values (all from the CLI's AppShell and Layout output):

- `height="auto"` on AppShell: the shell grows with the page; `'fill'` is for dashboards that scroll inside.
- `contentPadding={4}`: AppShell's guidance for forms and text.
- `contentWidth={640}`: Layout's suggested width for forms and text-focused pages.
- `height="auto"` on Layout: its default `'fill'` needs a container with a set height.

Two things the CLI does not settle. T1.7's test (`App.test.tsx`) must prove both, and T1.8 checks them:

1. **Heading placement.** AppShell's guidance says it "renders no heading, so the first heading in the content area is the page h1", which assumes the h1 is in main. This app puts its `h1` in the banner instead, as S1 and T1.7 require. The test asserts that one banner landmark holds a level-1 heading named `Todo`, and that there is one main landmark.
2. **TopNav with no nav items.** TopNav's anatomy lists "Navigation items" as required; this frame has none. If at 375px AppShell's mobile bar hides the heading behind the nav toggle, or opens an empty drawer, T1.7 may pass `mobileNav={false}` to AppShell. That is a printed prop: `false` disables the mobile drawer. T1.7 records the choice in its PR body.

## 5. npm scripts

These names are fixed. Later agents call them by name.

| Script | Command |
|---|---|
| `dev` | `vite` (template) |
| `build` | `tsc -b && vite build` (template) |
| `preview` | `vite preview` (template) |
| `typecheck` | `tsc -b` |
| `lint` | `eslint .` (template) |
| `test` | `vitest run` |
| `test:e2e` | `playwright test` |

The `test` and `test:e2e` commands are fixed by T1.3's done_when. The others are the template's defaults; T1.3 may change a command, but never a name.

Test settings (T1.3):

- **Vitest:** `environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']` (loads the jest-dom matchers), `passWithNoTests: true`, excludes `e2e/**`.
- **Playwright** (`playwright.config.ts`): `testDir: 'e2e'`; webServer runs `npm run build && npm run preview`; projects `Desktop Chrome` and `Pixel 7`.

## 6. File ownership

Copied from BACKLOG.md section 4. Each path has exactly one owner. **`src/main.tsx` is owned by T1.5.**

| Task | Owns |
|---|---|
| T1.1 | `docs/contracts/shell.md` |
| T1.3 | `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `README.md`, `src/vite-env.d.ts`, `src/test/setup.ts`, `playwright.config.ts`, and CLI-generated: every file `npx @astryxdesign/cli init` or `theme` writes (for 0.7.16: `AGENTS.md`, `CLAUDE.md` or `.claude/CLAUDE.md`, `GEMINI.md`, `src/astryx-themes.ts`), each listed in its PR body |
| T1.5 | `src/main.tsx`, `src/index.css` |
| T1.7 | `src/App.tsx`, `src/App.test.tsx`, and deletes `src/App.css`, `src/assets/react.svg`, `public/vite.svg` |

The Vite template also writes `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/App.css`, `src/assets/react.svg` and `public/vite.svg`. T1.3 commits them as the template wrote them and never hand-edits them. If the CLI rewrites one, T1.3 keeps the change and lists it. From then on they belong to T1.5 and T1.7 as above.

## 7. Rules for every shell task

- Import Astryx only from the specifier `npx @astryxdesign/cli component <Name>` prints for that component, and use only props it prints.
- No hard-coded colors, spacing, radii, shadows or fonts; tokens come from theme-neutral.
- No CSS file beyond `src/index.css`, and no inline `style` in the frame.
- Use only the theme-neutral theme, and only through `src/astryx-themes.ts`.

## 8. CLI version

`npx @astryxdesign/cli --help` reported `astryx: answered by CLI 0.7.16 with Core 0.7.16, outside a project`. Re-check this contract if a later release prints something different for any component above.
