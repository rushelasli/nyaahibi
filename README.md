# NyaaHibi — projects hub & main site

One Vue codebase that builds **two websites from one bundle** (a third view — the dashboard — is a page inside the hub):

| Site | URL | Entry file | Build output |
| --- | --- | --- | --- |
| **Projects hub** — landing page for every NyaaHibi project | <https://project.nyaahibi.web.id> | `hub.html` → `src/hub/main.ts` (no router) | `dist-hub/` |
| **Main site** — what NyaaHibi is, gateways to the hub / dashboard / portfolio | <https://nyaahibi.web.id> | `main.html` → `src/hub/main.ts` (`site=main`) | `dist-hub/main.html` |
| **Dashboard** — project cards + profile (a hub page, not a separate app) | <https://project.nyaahibi.web.id/dash/> | same hub app, picked by URL path | `dist-hub/dash/index.html` |

The personal profile site (**<https://ulilhibi.my.id>**) lives in its own
repository — **[rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi)** —
split out in Oct 2026. The two repos share an origin (theme tokens,
`nav`/`footer` copy, the site registry) but deploy independently. See
[`docs/architecture.md`](docs/architecture.md) for how the split works.

## Stack

- Vue 3 + Composition API + TypeScript
- Vite 8 + Bun
- Tailwind CSS v4 + shadcn-vue tokens
- `@lucide/vue` icons, `@vueuse/core`, `@google/model-viewer` (3D cards on the dashboard)
- `vue-i18n` (Indonesian + English) — no router: the hub picks pages from the URL

## Quick start

```bash
bun install

bun run dev:hub      # hub + main + /dash + /<slug> → http://localhost:5174/
bun run build:hub    # type-check + build → dist-hub/
bun run preview:hub  # preview the hub build (4173)
```

> **Portfolio dev** moved to [rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi)
> (`bun run dev` → port 5173 there). Details in
> [`docs/development.md`](docs/development.md).

## Documentation

| Doc | What's in it |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | The entries, the two-repo split, the domain map |
| [`docs/development.md`](docs/development.md) | Dev server, builds, tests, i18n, theme |
| [`docs/adding-a-site.md`](docs/adding-a-site.md) | Checklist: add a new project site to the hub |
| [`docs/dashboard.md`](docs/dashboard.md) | The `/dash/` page: what it renders, box-side assets, history |
| [`ops/README.md`](ops/README.md) | Homeserver runbook: Caddy, Cloudflare tunnel, `deploy.ps1` |

## Deploying

One script builds and ships the hub + main site to the homeserver:

```powershell
ops\deploy.ps1   # runs on the box — see ops/README.md
```

The portfolio deploys from its own repo with its own `ops\deploy.ps1`.

## License

MIT
