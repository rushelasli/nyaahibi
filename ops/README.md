# Homeserver runbook — Windows 10 + Caddy + Cloudflare Tunnel

> **Docs index:** [`../README.md`](../README.md) · architecture & the
> two-repo split: [`../docs/architecture.md`](../docs/architecture.md) ·
> local dev/tests: [`../docs/development.md`](../docs/development.md) ·
> adding a site: [`../docs/adding-a-site.md`](../docs/adding-a-site.md) ·
> the `/dash/` page: [`../docs/dashboard.md`](../docs/dashboard.md)

One box serves everything: the portfolio (deployed from
[rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi)) and the
projects hub + main site (this repo — `project.nyaahibi.web.id`, a
landing page plus all live sites under one subdomain with path routing,
and the apex `nyaahibi.web.id`). No open inbound ports — cloudflared
makes outbound-only connections to Cloudflare.

## Safety rules (repo is public)

1. **The one secret is the cloudflared tunnel token.** It lives on the box
   only (service config), never in this repo, never in screenshots. Rotate
   it from the Cloudflare dashboard if leaked.
2. **Serve `C:\srv\sites\*` only — never the git clones.** `.env` being
   gitignored does *not* protect it if Caddy's `root` points at the clone:
   the file exists on disk and would be published.
3. Future private repos deploy with a read-only deploy key / fine-grained
   PAT (`contents:read`) stored on the box — never committed, never in CI YAML.

## Folder layout

```
C:\srv\repos\hibi            git clone of this repo (hub + main site)
C:\srv\repos\ulilhibi        git clone of https://github.com/rushelasli/ulilhibi
C:\srv\repos\projects\<slug> git clones of live project sites (optional;
                             older boxes may name the folder `project` —
                             deploy.ps1 accepts both)
C:\srv\sites\hibi            served portfolio (dist mirror — produced by
                             the ulilhibi repo's deploy, not this one)
C:\srv\sites\projects        served hub:
                             index.html + assets/ + flags/ + logo/mascots
                             (the dist-hub landing, mirrored with /MIR)
                             projects/                 ... images + GLB models
                             <slug>/                    ... one folder per site
                             dash/                      ... existing dashboard
```

## One-time setup

1. **Windows prep**
   - Install [Git](https://git-scm.com/download/win) and
     [Bun](https://bun.sh/docs/installation) (system-wide).
   - Power plan: never sleep (`powercfg /change standby-timeout-ac 0`).
   - Windows Update: pause auto-restart (Win10 is EOL — keep updates manual
     and Defender on; the box has zero inbound exposure).
2. **cloudflared**
   - `winget install Cloudflare.cloudflared` (runs as a Windows service).
   - Create a tunnel in Zero Trust → Networks → Tunnels, add three public
     hostnames, all pointing at `http://localhost:8080`:
     - `ulilhibi.my.id` → portfolio (zone `my.id` in Cloudflare)
     - `project.nyaahibi.web.id` → hub (landing + site folders)
     - `nyaahibi.web.id` → main site (the explanatory landing at the root)
3. **Caddy**
   - Put this `ops/Caddyfile` at `C:\srv\caddy\Caddyfile`, adjust the
     portfolio hostname if your apex differs.
   - Run as a service: `caddy run --config C:\srv\caddy\Caddyfile` wrapped
     by WinSW or a Task Scheduler *At startup* task.
4. **Deploy scripts (one per repo)**
   - Clone this repo to `C:\srv\repos\hibi` and the portfolio to
     `C:\srv\repos\ulilhibi`; run each repo's `ops\deploy.ps1` once by
     hand, then schedule both (Task Scheduler, daily or on demand).
   - This repo's run builds the hub (`bun run build:hub` → `dist-hub/`),
     runs the hub SSR gate, then mirrors in the only safe order: hub
     landing (`/MIR`, resets the root — `dist-hub\projects\` ships with
     it, detail pages need those images; `dash` and the live slug
     folders are `/XD`-excluded so legacy content like `dsp.html`
     survives) → per-site folders → **hub detail-page overlay** (copies
     `dist-hub\<slug>\index.html` onto each live site folder, after the
     mirrors restored the old sites; slugs are derived from `hubSites`;
     `furuhibi` additionally gets the `preset/` + `download/` folders,
     the two emitted sub-pages (their stale `.html` originals are
     removed).
   - The portfolio's run (its own script) builds `dist/`, runs its SSR
     gate, and mirrors to `C:\srv\sites\hibi`.
   - Local-only gate: `python3 ops/check_classes.py` (after
     `bun run build:hub`) verifies every class token used in the SFCs and
     locales exists in the built CSS.

## Cloudflare edge rules

- **Cache rule / Always Online** for both hostnames — keeps the site
  serving from cache when the box is offline.
- **Redirect Rules (301)** for the move to the hub:
  - `furuhibi.nyaahibi.web.id/*` → `project.nyaahibi.web.id/furuhibi/$1`
  - same pattern for `amp.`/`microamp.` subdomains when they retire.

## Hub landing + detail pages (this repo)

- Hostnames: `project.nyaahibi.web.id` serves the hub (landing + site
  folders); the apex `nyaahibi.web.id` serves the **main landing**
  (`main.html`) at its root from the same content root — `/dash`,
  `/<slug>`, and `/furuhibi/*` deep links resolve on both. `project.`
  stays canonical in `PROJECTS_BASE`, the og:url heads, and the
  portfolio's registry links.
- Source: `hub.html` + `main.html` + `src/hub/` — theme tokens, locale
  files (`hub.*`, `dash.*`, `main.*` keys), `ThemeToggle`,
  `LocaleToggle`, and logo, all copies of the portfolio repo's versions
  (kept in sync by review).
- Cards are driven by `hubSites` in `src/data/projects.ts`
  (`slug`, `status: live|soon`, optional `extra` link, optional `model`
  GLB path used by the dashboard) plus three
  `hub.sites.<slug>` locale keys per language (title, desc, tags). Each
  live card links "See detail" to `/<slug>`; `extra` adds a second link
  (e.g. FuruHibi's WebUSB DSP panel).
- **Detail pages have no router.** `main.ts` passes
  `window.location.pathname` into `HubApp`, which renders the matching
  page composer from `detailPages` (reusing the shared
  `src/components/project/` sections; the back link is a plain
  `href="/"`). Unknown or soon slugs fall back to the landing.
  `vite.hub.config.ts` writes `dist-hub/<slug>/index.html` for every live
  slug so local previews behave like the deployed folders, and
  `deploy.ps1` overlays the same file onto each live site folder after
  the per-site mirrors.
- **FuruHibi sub-pages** (`/furuhibi/preset` Cloud PEQ Presets,
  `/furuhibi/download` Download Center) route the same way —
  `HubApp`'s `subPages` map picks the composer from the pathname. They
  are **folders**, not `.html` files: `vite.hub.config.ts` emits
  `dist-hub/furuhibi/{preset,download}/index.html` beside the landing
  with their own `<title>`/description heads, and `deploy.ps1` overlays
  them onto the box's `furuhibi/` folder (which keeps `dsp.html` and
  the assets box-side; the clean `/furuhibi/dsp` route reaches that
  file through Caddy's `try_files {path}.html`). The Vue ports talk to the
  same `app.nyaahibi.web.id` APIs as the live pages
  (`/api/presets`, `/api/dsp-presets`, `/api/downloads/<category>`).
- **Dashboard (`/dash/`)** — the old standalone `dash/` HTML rebuilt in
  this repo (`src/hub/DashboardPage.vue`, `dash.*` locale keys): same
  header, 8 project cards (GLB viewers from `hubSites.model`, "Open
  Website" buttons to `/<slug>` or `comingsoon.html`), profile card, and
  the WIB clock + `/stats` footer. `vite.hub.config.ts` writes
  `dist-hub/dash/index.html`; `deploy.ps1` overlays only that file onto
  the box's `dash/` folder — its GLBs, `gwe.png`, and `comingsoon.html`
  stay box-side (`/XD dash` protects them from the root mirror).
- Mascots (`maskotkiri.png` / `maskotkanan.png`) and `logo.png` live in
  `public/` and ship with the hub build; the mascots render only on the
  two home pages (`LandingMascots.vue`, gated in `HubApp`). Project
  images and GLB models come from `public/projects/` (served as
  `/projects/...` on the hub).

## Migrating a live site's card to the hub

1. Ensure `C:\srv\repos\projects\<slug>` is a clone and `deploy.ps1` mirrored
   it to `C:\srv\sites\projects\<slug>`.
2. In the portfolio repo (`rushelasli/ulilhibi`): point its
   `projectLinks` entry at `` `${PROJECTS_BASE}/<slug>` ``
   (`src/data/projects.ts`) — its SSR test derives its assertions from
   that registry, so nothing else changes.
3. Give the slug a **detail page**: add `hub.sites.<slug>` locale keys
   (title, desc, tags), a composer in `HubApp`'s `detailPages` (reuse an
   existing page or add `src/pages/<Name>Project.vue` + its own locale
   namespace), and a `detailPages` entry in `test/hub.render.test.ts`.
   `deploy.ps1` derives its overlay list from `hubSites`, so a live slug
   without a composer would serve the landing app at `/<slug>/` — the
   hub test fails until both maps cover every live slug.
4. Deploy this repo; add the Cloudflare 301 from the old subdomain.
