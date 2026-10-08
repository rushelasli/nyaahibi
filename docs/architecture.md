# Architecture — one repo, two sites from one bundle

This repo builds **two separate static websites** from a single shared
Vue app, and records how the Oct 2026 **split** with the portfolio
(now `rushelasli/ulilhibi`) draws the boundary between the two repos.

## The entries

```
hibi/
├── hub.html     ──► src/hub/main.ts ──► Vue app, NO router    ──► dist-hub/  ──► project.nyaahibi.web.id
└── main.html    ──► src/hub/main.ts ──► same app, site=main   ──► dist-hub/  ──► nyaahibi.web.id (apex)
```

Two HTML files, **one** `main.ts` entry point (`main.html` reuses the
hub's, declaring its variant via `<meta name="site" content="main">`),
one app config (`vite.hub.config.ts`), one build script
(`bun run build:hub`). A second `vite.config.ts` exists only so the bare
SSR gate command (`bunx vite build --ssr test/…`) has the Vue plugin and
the `@` alias — no app build uses it.

| | Hub (`project.nyaahibi.web.id`) | Main site (apex `nyaahibi.web.id`) |
| --- | --- | --- |
| Entry | `hub.html` (no `site` meta → `site=hub`) | `main.html` (`<meta name="site" content="main">`) |
| Landing | `HubLanding` — cards for every `hubSites` entry | `MainLanding` — what NyaaHibi is + gateways |
| Deep links | `/dash/`, `/<slug>/` (detail pages) | same paths — same content root |
| Routing | **None** — `HubApp` reads `window.location.pathname` and picks a view | same app |
| Build | `vite.hub.config.ts` → `dist-hub/` | shares it |

### Why the hub has no router

Every live project is a **static folder** on the server
(`project.nyaahibi.web.id/<slug>/index.html`), all serving the *same* app
bundle. `HubApp` receives `window.location.pathname` as a prop and maps it
to a view:

```
/                → HubLanding        (hub.html: cards for every hubSites entry)
                 → MainLanding       (main.html: what NyaaHibi is + gateways)
/<slug>/         → detail page       (detailPages map in src/hub/HubApp.vue)
/dash/           → DashboardPage     (src/hub/DashboardPage.vue)
/furuhibi/preset         → FuruhibiPresetsPage   (subPages map)
/furuhibi/download       → FuruhibiDownloadPage  (subPages map)
anything else    → the entry's own landing ("soon" slugs land on HubLanding)
```

`vite.hub.config.ts` writes a per-slug `index.html` (with that project's own
`<title>`/`og:` meta for crawlers) into `dist-hub/<slug>/` at build time,
`dist-hub/dash/index.html` for the dashboard, and — as folders, so the
routes stay extensionless — `dist-hub/furuhibi/preset/index.html` and
`dist-hub/furuhibi/download/index.html` for the two FuruHibi sub-pages.
`deploy.ps1` then overlays those files onto the server's folders;
`dist-hub/main.html` ships with the root mirror as-is (the apex Caddy
block serves it at `/`).

## The split with the portfolio (Oct 2026)

The personal profile site — originally this repo's `index.html` app —
moved to **[rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi)**.
The boundary:

| | This repo (hub + main) | `rushelasli/ulilhibi` (portfolio) |
| --- | --- | --- |
| Entries | `hub.html`, `main.html` | `index.html` + vue-router |
| Pages | `src/hub/*`, 5 detail pages, 2 FuruHibi sub-pages, `project/` + `furuhibi/` sections | home page + profile sections, `ui/` components |
| Locale keys | `nav`, `footer`, `hub.*`, `dash.*`, `main.*`, per-project namespaces (645 keys) | `meta`, `nav`, `common`, profile namespaces (112 keys) |
| Registry | `hubSites` + base URLs | `projectLinks` + base URLs |
| Build | `bun run build:hub` → `dist-hub/` | `bun run build` → `dist/` |
| Deploy | `ops/deploy.ps1` → `C:\srv\sites\projects` | its own `ops/deploy.ps1` → `C:\srv\sites\hibi` |
| SSR gate | `test/hub.render.test.ts` | its own `test/render.test.ts` |

What is deliberately duplicated (kept in sync by review, not tooling):
`src/style.css` theme tokens, `ThemeToggle` + `LocaleToggle`, the
`nav`/`footer` locale namespaces, and the base-URL constants in
`src/data/projects.ts`. The legacy `/projects/*` mirrors retired with the
split — this repo keeps the pages the hub renders (`src/pages/`), the
portfolio keeps only `/`.

## What's still shared inside this repo

- **`src/data/projects.ts` — the single source of truth.** `hubSites`
  drives the landing cards, the dashboard cards, the deploy script's live
  slug list, the per-slug HTML generation, and the test assertions.
  `PROJECTS_BASE` / `PORTFOLIO_BASE` hold the two outbound domains.
- **`src/locales/en.json` + `id.json`** — hub copy (`hub.*`, `dash.*`,
  `main.*`, per-project `amp.*`, `furuhibi.*`, …).
- **`src/pages/*.vue` + `src/components/`** — the project detail pages
  render on both the hub and the main site. Shared chrome:
  `ThemeToggle`, `LocaleToggle`.
- **`src/style.css`** — one Tailwind v4 theme (tokens, dark variant,
  fonts) used by both entries.
- **`test/`** — an SSR render gate that renders the real app and asserts
  on the HTML (see `docs/development.md`).
- **`ops/deploy.ps1`** — builds *and deploys* both hostnames in a fixed
  order.

## Domain map

| Domain | Serves | Notes |
| --- | --- | --- |
| `ulilhibi.my.id` | Portfolio (`dist/` from **rushelasli/ulilhibi**) | Moved here from the old apex; that repo deploys it |
| `project.nyaahibi.web.id` | Hub landing + `/<slug>/` folders + `/dash/` (`dist-hub/` + per-site clones) | One subdomain, path routing |
| `nyaahibi.web.id` | Main site — explanatory landing (`dist-hub/main.html`) at the root | Same content root as the hub: `/dash` and `/<slug>` deep links resolve here too; `project.` stays canonical in code |

`PROJECTS_BASE` / `PORTFOLIO_BASE` in `src/data/projects.ts` and the
`og:url` heads must always match the live domains — in **both** repos.

## Where each build lands on the server

```
C:\srv\sites\hibi       ← dist/          (portfolio — deployed by rushelasli/ulilhibi)
C:\srv\sites\projects   ← dist-hub/      (hub landing at root, main.html alongside)
    ├── <slug>/         ← per-site clones, with dist-hub/<slug>/index.html overlaid
    │                     (furuhibi/ also gets preset/ + download/ overlaid)
    └── dash/           ← legacy box-side assets, with dist-hub/dash/index.html overlaid
```

The overlay pattern is why detail pages and the dashboard can be rebuilt
from this repo while their assets (GLB models, downloads,
`comingsoon.html`) stay box-side. Full runbook: `ops/README.md`.
