# Hibiji — Portfolio & NyaaHibi Projects Hub

One Vue codebase that builds **two websites** (the dashboard and the main-site landing are pages inside the hub build):

| Site | URL | Entry file | Build output |
| --- | --- | --- | --- |
| **Portfolio** — Ulil Albab's profile site | <https://ulilhibi.my.id> | `index.html` → `src/main.ts` (vue-router) | `dist/` |
| **Projects hub** — landing page for every NyaaHibi project | <https://project.nyaahibi.web.id> | `hub.html` → `src/hub/main.ts` (no router) | `dist-hub/` |
| **Main site** — what NyaaHibi is, gateways to the hub / dashboard / portfolio | <https://nyaahibi.web.id> | `main.html` → `src/hub/main.ts` (`site=main`) | `dist-hub/main.html` |
| **Dashboard** — project cards + profile (a hub page, not a separate app) | <https://project.nyaahibi.web.id/dash/> | same hub app, picked by URL path | `dist-hub/dash/index.html` |

Both apps share one `src/` tree: theme, locale files, project pages, and the
site registry (`src/data/projects.ts`). See
[`docs/architecture.md`](docs/architecture.md) for how they fit together and
why the repo is deliberately **not** split.

## Stack

- Vue 3 + Composition API + TypeScript
- Vite 8 + Bun
- Tailwind CSS v4 + shadcn-vue / reka-ui (`Button`, `Card`, `Sheet`)
- `@lucide/vue` icons, `@vueuse/core`, `@google/model-viewer` (3D cards on the dashboard)
- `vue-i18n` (Indonesian + English), `vue-router` (portfolio only — the hub picks pages from the URL)

## Quick start

```bash
bun install

bun run dev          # portfolio → http://localhost:5173/
bun run dev:hub      # hub + main + /dash + /<slug> → http://localhost:5174/
bun run build        # type-check + build portfolio → dist/
bun run build:hub    # build hub (main landing + dashboard too) → dist-hub/
bun run preview      # preview the portfolio build
bun run preview:hub  # preview the hub build
```

> **Dev note:** the main landing is `http://localhost:5174/main.html`;
> `/dash` and the slugs only work under `dev:hub` (plain `dev` serves the
> portfolio fallback). Details in [`docs/development.md`](docs/development.md).

## Documentation

| Doc | What's in it |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | The entries, what they share, why one repo |
| [`docs/development.md`](docs/development.md) | Dev servers, builds, tests, i18n, theme |
| [`docs/adding-a-site.md`](docs/adding-a-site.md) | Checklist: add a new project site to the hub |
| [`docs/dashboard.md`](docs/dashboard.md) | The `/dash/` page: what it renders, box-side assets, history |
| [`ops/README.md`](ops/README.md) | Homeserver runbook: Caddy, Cloudflare tunnel, `deploy.ps1` |

## Deploying

One script builds and ships both sites to the homeserver:

```powershell
ops\deploy.ps1   # runs on the box — see ops/README.md
```

## Assets

Replace `src/assets/profil.jpg` with your own photo; project images and GLB
models live under `public/projects/`.

## License

MIT
