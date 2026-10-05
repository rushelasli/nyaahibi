# Architecture — one repo, two websites (plus a dashboard page)

This repo builds **two separate static websites** from one shared `src/`
tree. This document explains how, and records *why it is deliberately not
split into multiple repos* — so the question doesn't have to be reopened.

## The entries

```
hibi/
├── index.html   ──► src/main.ts    ──► Vue app + vue-router  ──► dist/       ──► ulilhibi.my.id
├── hub.html     ──► src/hub/main.ts ──► Vue app, NO router    ──► dist-hub/  ──► project.nyaahibi.web.id
└── main.html    ──► src/hub/main.ts ──► same app, site=main   ──► dist-hub/  ──► nyaahibi.web.id (apex)
```

Three HTML files sharing two `main.ts` entry points (`main.html` reuses the
hub's, declaring its variant via `<meta name="site" content="main">`), two
Vite configs (`vite.config.ts` and `vite.hub.config.ts`), two build scripts
(`bun run build` and `bun run build:hub`). Everything else is shared.

| | Portfolio (`ulilhibi.my.id`) | Hub (`project.nyaahibi.web.id` + apex) |
| --- | --- | --- |
| Entry | `index.html` → `src/main.ts` | `hub.html` / `main.html` → `src/hub/main.ts` |
| Routing | vue-router (`src/router.ts`) | **None** — `HubApp` reads `window.location.pathname` and picks a view |
| Pages | `src/pages/HomePage.vue` + legacy `/projects/*` mirrors | Landing (`HubLanding`), main landing (`MainLanding`), 5 project detail pages + `/dash/` |
| Build | `vite.config.ts` → `dist/` | `vite.hub.config.ts` → `dist-hub/` |

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
anything else    → the entry's own landing ("soon" slugs land on HubLanding)
```

`vite.hub.config.ts` writes a per-slug `index.html` (with that project's own
`<title>`/`og:` meta for crawlers) into `dist-hub/<slug>/` at build time, and
`dist-hub/dash/index.html` for the dashboard. `deploy.ps1` then overlays
those files onto the server's folders; `dist-hub/main.html` ships with the
root mirror as-is (the apex Caddy block serves it at `/`).

## What the two apps share

- **`src/data/projects.ts` — the single source of truth.** `hubSites`
  drives the landing cards, the dashboard cards, the deploy script's live
  slug list, the per-slug HTML generation, and the test assertions.
  `PROJECTS_BASE` / `PORTFOLIO_BASE` hold the two domains.
- **`src/locales/en.json` + `id.json`** — all copy for both apps
  (namespaces like `hub.*`, `dash.*`, `main.*`, plus per-project `amp.*`,
  `furuhibi.*`).
- **`src/pages/*.vue` + `src/components/`** — the project detail pages are
  the *same Vue components* on both sites (the portfolio's `/projects/amp`
  and the hub's `/nyaahibiv2/` are `AmpProject.vue`). Shared chrome:
  `ThemeToggle`, `LocaleToggle`.
- **`src/style.css`** — one Tailwind v4 theme (tokens, dark variant,
  fonts) used by both entries.
- **`test/`** — two SSR render gates that render the real apps and assert
  on the HTML (see `docs/development.md`).
- **`ops/deploy.ps1`** — one script builds *and deploys both* sites in a
  fixed order.

## Why not split into separate repos

Considered and rejected (Oct 2026). Splitting would require:

1. A shared package (published or vendored) for pages/locales/theme/data —
   because the hub's detail pages *are* portfolio components.
2. Two deploy pipelines replacing the single `deploy.ps1` that currently
   builds both and mirrors them in the correct order.
3. Test orchestration across repos, while today one script runs both gates.

The coupling is total and intentional; a split adds moving parts without
reducing any real maintenance burden.

**The one condition that would change this:** if the dashboard (or any
future site in this repo) needs **private secrets or a backend** — this is
a *public* repo, so secrets must never live in it (see `ops/README.md`
"Safety rules"). A private app should be a separate private repo. Until
then: one repo, multiple entries. If the flat root ever gets unwieldy,
prefer a bun-workspace layout (`apps/portfolio`, `apps/hub`,
`packages/shared`) *within this repo* before considering a split.

## Domain map

| Domain | Serves | Notes |
| --- | --- | --- |
| `ulilhibi.my.id` | Portfolio (`dist/`) | Moved here from the old apex (see below) |
| `project.nyaahibi.web.id` | Hub landing + `/<slug>/` folders + `/dash/` (`dist-hub/` + per-site clones) | One subdomain, path routing |
| `nyaahibi.web.id` | Main site — explanatory landing (`dist-hub/main.html`) at the root | Same content root as the hub: `/dash` and `/<slug>` deep links resolve here too; `project.` stays canonical in code |

`PORTFOLIO_BASE` in `src/data/projects.ts` and the `og:url` tag in
`index.html` must always match the live portfolio domain.

## Where each build lands on the server

```
C:\srv\sites\hibi       ← dist/          (portfolio)
C:\srv\sites\projects   ← dist-hub/      (hub landing at root, main.html alongside)
    ├── <slug>/         ← per-site clones, with dist-hub/<slug>/index.html overlaid
    └── dash/           ← legacy box-side assets, with dist-hub/dash/index.html overlaid
```

The overlay pattern is why detail pages and the dashboard can be rebuilt
from this repo while their assets (GLB models, downloads, `comingsoon.html`)
stay box-side. Full runbook: `ops/README.md`.
