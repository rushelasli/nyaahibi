# Development guide

How to run, build, and test this repo locally. Read
[`architecture.md`](architecture.md) first if the two-entry setup is new
to you.

## Prerequisites

- [Bun](https://bun.sh) (installs deps, runs scripts)
- Node is used only to run test bundles (`node ...` — any modern LTS)

```bash
bun install
```

## Dev servers

```bash
bun run dev        # portfolio → http://localhost:5173/
bun run dev:hub    # hub + main + /dash + /<slug> → http://localhost:5174/
```

Both can run at once — one port each:

| URL | What you get |
| --- | --- |
| `http://localhost:5173/` | Portfolio |
| `http://localhost:5173/hub.html` | Hub shell only — `/dash` & slugs fall back to the portfolio, use `dev:hub` |
| `http://localhost:5174/` | Hub landing |
| `http://localhost:5174/main.html` | Main-site landing (the apex `nyaahibi.web.id` interface) |
| `http://localhost:5174/dash` | Dashboard |
| `http://localhost:5174/nyaahibiv2` | That slug's detail page (all five work) |

`dev:hub` mirrors production's layout with a dev-only middleware in
`vite.hub.config.ts`: extensionless GET/HEAD paths are served `hub.html`
(Vite's SPA fallback would otherwise serve the *portfolio's*
`index.html`), and `HubApp` picks the page from the real
`window.location.pathname` — the same routing the deployed site uses,
but with HMR. Real files such as `/main.html` pass straight through.

Box-only files don't exist in the repo, and dev mirrors production's
`try_files` fallback for them: `/furuhibi/dsp.html`,
`/dash/comingsoon.html`, and the GLB models under `/dash/` all serve the
HTML shell locally (model cards show gray panels). They work once
deployed, where those files live on the server box.

For a production-shaped check — the generated per-slug and `/dash/`
folders with their injected `<title>`s — build and preview instead:

```bash
bun run build:hub
bun run preview:hub
# → http://localhost:4173/  ·  /dash/  ·  /furuhibi/  ·  /nyaahibiv2/
```

(`deploy.ps1` and the gate commands copy `hub.html` → `index.html` in
`dist-hub/` so the preview root works; on the deployed server Caddy's
`try_files` + the deploy overlay make every path work.)

## Builds

| Command | Does | Output |
| --- | --- | --- |
| `bun run build` | `vue-tsc -b` (type-check) **then** Vite build — portfolio | `dist/` |
| `bun run build:hub` | Vite build only — hub landing, per-slug pages, dashboard head | `dist-hub/` |
| `bun run preview` | Serves `dist/` | — |
| `bun run preview:hub` | Serves `dist-hub/` | — |

Both builds must succeed before deploying — `ops/deploy.ps1` runs them in
order and aborts on failure. The type-check gate is part of `bun run build`
only; `build:hub` assumes types already passed.

> The Tailwind build step is the slow part (~2 min on a modest box).
> That's normal.

## Tests (SSR render gates)

There is no unit-test framework. Instead, two **SSR render tests** render
the real apps to HTML strings and assert on the output (i18n keys resolve,
expected copy exists, correct links, locale parity, no dead domains).
`deploy.ps1` refuses to deploy if either fails, so run them before pushing
anything that touches shared code.

```bash
# 1. Portfolio gate
bunx vite build --ssr test/render.test.ts --outDir node_modules/.tmp/ssr
node node_modules/.tmp/ssr/render.test.js

# 2. Hub gate (landing + all detail pages + dashboard)
bunx vite build --ssr test/hub.render.test.ts --outDir node_modules/.tmp/ssr-hub
node node_modules/.tmp/ssr-hub/hub.render.test.js
```

Expected endings: `ALL SSR RENDER CHECKS PASSED` and
`ALL HUB RENDER CHECKS PASSED`.

Notes:

- `--outDir` **must stay inside the repo** (`node_modules/.tmp/…`). Node
  resolves imports like `vue` by walking up from the bundle — an outDir
  under `/tmp` fails with `ERR_MODULE_NOT_FOUND`. (Ignore the older
  command in `test/render.test.ts`'s header comment that suggests
  `/tmp/opencode/ssr`.)
- The tests import `test/stubs.ts` first, which stubs browser globals
  (`window`, `document`, `localStorage`, …) so SSR works in Node.
- **Adding a new locale namespace or project?** Update the `KEY_LEAK` /
  `ATTR_KEY_LEAK` regexes at the top of both test files — they list the
  i18n namespaces each app renders and catch unresolved keys leaking into
  HTML (a namespace missing from the regex won't be checked, so add it).
  Also add detail-page expectations in `test/hub.render.test.ts` (see
  [adding-a-site.md](adding-a-site.md)).

### Class-token gate (optional, local)

After `bun run build`, verifies every Tailwind-looking class token used in
`.vue` files and locale JSON actually exists in the built CSS:

```bash
python3 ops/check_classes.py
```

## i18n

- Two locales: `id` (Indonesian, **fallback**) and `en` —
  `src/locales/id.json`, `src/locales/en.json`. Keep them at key parity;
  the tests fail on leaked/unresolved keys.
- Initial locale: `localStorage.locale` → browser language → `id`
  (`src/i18n.ts`).
- A few messages contain HTML (`<a>`, `<strong>`) and are rendered with
  `v-html` — safe because locale files are static, authored content.
- Namespace map (top-level keys of the locale files): `nav`, `hero`,
  `about`, `projects`, `skills`, `experience`, `contact`, `footer`, `meta`,
  `common`, per-project (`amp`, `ampgen1`, `microamp`, `furuhibi`,
  `tubese`), plus `hub` (hub landing), `dash` (dashboard), and `main`
  (apex landing).

## Theme

- One theme for both apps: `src/style.css` (Tailwind v4 `@theme`, HSL
  tokens in `:root` / `.dark`).
- Default is **dark**; `index.html`/`hub.html`/`main.html` apply the
  stored `localStorage.theme` before first paint to avoid a flash.
- `ThemeToggle` flips the `.dark` class; `LocaleToggle` switches `id`/`en`.
  Both are shared between the apps.

## Repo map (quick)

```
index.html / hub.html / main.html   the three entries (main shares the hub's main.ts)
vite.config.ts               portfolio build
vite.hub.config.ts           hub build (+ generates dist-hub/<slug>/ and /dash/ HTML)
src/main.ts                  portfolio entry
src/hub/                     hub entry: main.ts, HubApp, HubLanding, MainLanding, DashboardPage
src/router.ts                portfolio routes (/, /projects/*)
src/pages/                   project detail pages (shared by both apps)
src/components/              sections + shared chrome (ThemeToggle, LocaleToggle, ui/)
src/data/projects.ts         ★ single source of truth: hubSites, domains, card links
src/locales/                 id.json / en.json (all copy)
test/                        SSR render gates (+ browser stubs)
ops/                         deploy.ps1, Caddyfile, runbook (ops/README.md)
```
