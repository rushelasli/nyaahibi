# Development guide

How to run, build, and test this repo locally. Read
[`architecture.md`](architecture.md) first if the hub/main entry setup
is new to you. The portfolio app lives in
[rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi) and has
its own guide there.

## Prerequisites

- [Bun](https://bun.sh) (installs deps, runs scripts)
- Node is used only to run test bundles (`node ...` — any modern LTS)

```bash
bun install
```

## Dev server

```bash
bun run dev:hub    # hub + main + /dash + /<slug> → http://localhost:5174/
```

| URL | What you get |
| --- | --- |
| `http://localhost:5174/` | Hub landing |
| `http://localhost:5174/main.html` | Main-site landing (the apex `nyaahibi.web.id` interface) |
| `http://localhost:5174/dash` | Dashboard |
| `http://localhost:5174/nyaahibiv2` | That slug's detail page (all five work) |
| `http://localhost:5174/furuhibi/preset.html` | FuruHibi Cloud PEQ Presets sub-page |
| `http://localhost:5174/furuhibi/download.html` | FuruHibi Download Center sub-page |

(The portfolio's dev server — port 5173 — lives in
[rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi).)

`dev:hub` mirrors production's layout with a dev-only middleware in
`vite.hub.config.ts`: extensionless GET/HEAD paths are served `hub.html`
(there is no `index.html` in this repo anymore — the portfolio took it
with the split), and `HubApp` picks the page from the real
`window.location.pathname` — the same routing the deployed site uses,
but with HMR. Real files such as `/main.html` pass straight through, and
the two FuruHibi sub-paths (`/furuhibi/preset.html`,
`/furuhibi/download.html`) are special-cased to the shell — in production
they are real emitted files, in dev they don't exist on disk.

Box-only files don't exist in the repo, and dev mirrors production's
`try_files` fallback for them: `/furuhibi/dsp.html`,
`/dash/comingsoon.html`, and the GLB models under `/dash/` all serve the
HTML shell locally (model cards show gray panels). They work once
deployed, where those files live on the server box.

For a production-shaped check — the generated per-slug, `/dash/`, and
FuruHibi sub-page folders with their injected `<title>`s — build and
preview instead:

```bash
bun run build:hub
bun run preview:hub
# → http://localhost:4173/  ·  /dash/  ·  /furuhibi/  ·  /nyaahibiv2/
#   /furuhibi/preset.html  ·  /furuhibi/download.html
```

(`deploy.ps1` and the gate commands copy `hub.html` → `index.html` in
`dist-hub/` so the preview root works; on the deployed server Caddy's
`try_files` + the deploy overlay make every path work.)

## Builds

| Command | Does | Output |
| --- | --- | --- |
| `bun run build:hub` | `vue-tsc -b` (type-check) **then** Vite build — hub landing, main site, per-slug pages, dashboard head | `dist-hub/` |
| `bun run preview:hub` | Serves `dist-hub/` | — |

`build:hub` runs `vue-tsc -b` first and aborts on any type error —
`ops/deploy.ps1` runs it + the SSR gate, so a broken type never reaches
the live site. (`vite.config.ts` is not an app build config: it only
supplies the Vue plugin + `@` alias to the bare `bunx vite build --ssr …`
gate command below.)

> The Tailwind build step is the slow part (~2 min on a modest box).
> That's normal.

## Tests (SSR render gates)

There is no unit-test framework. Instead, an **SSR render test** renders
the real app to HTML strings — hub landing, main landing, every detail
page, and the dashboard — and asserts on the output (i18n keys resolve,
expected copy exists, correct links, locale parity, no dead domains).
`deploy.ps1` refuses to deploy if it fails, so run it before pushing
anything that touches shared code. (The portfolio's own gate lives in
[rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi).)

```bash
bunx vite build --ssr test/hub.render.test.ts --outDir node_modules/.tmp/ssr-hub
node node_modules/.tmp/ssr-hub/hub.render.test.js
```

Expected ending: `ALL HUB RENDER CHECKS PASSED`.

Notes:

- `--outDir` **must stay inside the repo** (`node_modules/.tmp/…`). Node
  resolves imports like `vue` by walking up from the bundle — an outDir
  under `/tmp` fails with `ERR_MODULE_NOT_FOUND`.
- The test imports `test/stubs.ts` first, which stubs browser globals
  (`window`, `document`, `localStorage`, …) so SSR works in Node.
- **Adding a new locale namespace or project?** Update the `KEY_LEAK` /
  `ATTR_KEY_LEAK` regexes at the top of `test/hub.render.test.ts` — they
  list the i18n namespaces each app renders and catch unresolved keys
  leaking into HTML (a namespace missing from the regex won't be checked,
  so add it). Also add detail-page expectations in the same file (see
  [adding-a-site.md](adding-a-site.md)).

### Class-token gate (optional, local)

After `bun run build:hub`, verifies every Tailwind-looking class token
used in `.vue` files and locale JSON actually exists in the built CSS
(`dist-hub/assets`):

```bash
python3 ops/check_classes.py
```

## Component structure (split rule)

- **Page SFCs are thin shells — ≤ ~40 lines.** `src/pages/*.vue` hold
  props, imports, and a template that composes sections; no logic, no
  copy. (See `FuruhibiProject.vue`, `FuruhibiPresetsPage.vue`.)
- **Section components stay ≤ ~90 lines.** Anything bigger gets split:
  a sub-component for a distinct UI block, or a composable `.ts` module
  for the state/logic (`usePresetLists.ts`, `usePresetCard.ts`,
  `useDownloadFiles.ts` are the model).
- **Interactive logic lives in `.ts` modules**, not in SFC `<script>`
  blocks: widget engines and math (`furuhibi/widgets/*.ts`,
  `presets/eqCurve.ts`), API clients (`presetsApi.ts`,
  `downloadsApi.ts`), device links (`presets/bleDevice.ts`). This keeps
  the SFCs declarative and the engines unit-testable and SSR-safe
  (client-only side effects run in `onMounted`).

## i18n

- Two locales: `id` (Indonesian, **fallback**) and `en` —
  `src/locales/id.json`, `src/locales/en.json`. Keep them at key parity;
  the tests fail on leaked/unresolved keys. (653 keys since the
  portfolio split — the portfolio repo keeps its own 112.)
- Initial locale: `localStorage.locale` → browser language → `id`
  (`src/i18n.ts`).
- A few messages contain HTML (`<a>`, `<strong>`) and are rendered with
  `v-html` — safe because locale files are static, authored content.
- Namespace map (top-level keys of the locale files): `nav`, `footer`,
  per-project (`amp`, `ampgen1`, `microamp`, `furuhibi`, `tubese`), plus
  `hub` (hub landing), `dash` (dashboard), and `main` (apex landing).
  The profile namespaces (`hero`, `about`, `projects`, `skills`,
  `experience`, `contact`, `meta`, `common`) moved with the portfolio to
  [rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi).

## Theme

- One theme: `src/style.css` (Tailwind v4 `@theme`, HSL tokens in
  `:root` / `.dark`) — the portfolio repo carries a copy of the same
  tokens (kept in sync by review).
- Default is **dark**; `hub.html`/`main.html` apply the stored
  `localStorage.theme` before first paint to avoid a flash.
- `ThemeToggle` flips the `.dark` class; `LocaleToggle` switches `id`/`en`.
  Both are shared by the hub and main pages (and mirrored in the
  portfolio repo).

## Repo map (quick)

```
hub.html / main.html   the two entries (main shares the hub's main.ts)
vite.config.ts         SSR-gate config only (Vue plugin + @ alias)
vite.hub.config.ts     app build (+ generates dist-hub/<slug>/ and /dash/ HTML)
src/hub/               hub entry: main.ts, HubApp, HubLanding, MainLanding, DashboardPage
src/pages/             project detail pages
src/components/        project/ + furuhibi/ sections + shared chrome (ThemeToggle, LocaleToggle)
src/data/projects.ts   ★ single source of truth: hubSites, domains
src/locales/           id.json / en.json (hub-side copy of the split keys)
test/                  SSR render gate (+ browser stubs)
ops/                   deploy.ps1, Caddyfile, runbook (ops/README.md)
```
