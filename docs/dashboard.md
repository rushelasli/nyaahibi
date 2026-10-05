# The dashboard (`/dash/`)

The NyaaHibi dashboard — project cards, creator profile, live clock —
is **a page inside the hub app**, not a separate website:

- **URL:** <https://project.nyaahibi.web.id/dash/>
- **Source:** `src/hub/DashboardPage.vue` (locale namespace `dash.*`)
- **Routing:** `HubApp` shows it when the path is `/dash`
  (no router — same mechanism as the detail pages, see
  [`architecture.md`](architecture.md))
- **Generated HTML:** `vite.hub.config.ts` writes
  `dist-hub/dash/index.html` with its own `<title>`/description for
  crawlers: *"Dashboard — NyaaHibi Projects"*.

## What it renders

1. **Header** — centered logo, title, tagline, and a back link to the
   hub landing (`/`).
2. **Project cards** — one per `hubSites` entry (all 8, curated order):
   - 3D preview via `<model-viewer>` when the site has a `model` field;
   - the logo image for the AMP card (`CARD_IMAGES` in the component);
   - a plain panel otherwise.
   - **Open Website** → `/<slug>` for live sites, `/dash/comingsoon.html`
     for `soon` ones; plus FuruHibi's WebUSB button from `extra`.
3. **Profile card** — photo (`/dash/gwe.png`), bios, **About Me** →
   the portfolio's `#about`, **Chat Me** → the FB share link.
4. **Footer band** — live WIB clock (`Asia/Jakarta`, locale-aware date)
   and a best-effort visit counter fetched from `/stats`. If the endpoint
   doesn't answer with `{ total, today }`, the counter line simply stays
   hidden — the page never breaks over it.

## Box-side assets (not in this repo)

Only the **`index.html`** comes from this repo. Everything else lives in
`C:\srv\sites\projects\dash\` on the homeserver and is deliberately
excluded from mirrors (the root `/MIR` in `deploy.ps1` passes `/XD dash`,
so neither `dist-hub\dash\` nor the server folder is touched by it):

| Asset | Where | Notes |
| --- | --- | --- |
| `/dash/*.glb` (3D models) | box-side | Referenced by `hubSites.model`; upload new GLBs to the server, not this repo |
| `/dash/comingsoon.html` | box-side | Target for `soon` cards' buttons |
| `/dash/gwe.png` (profile photo) | box-side **and** `public/dash/` in the repo | The repo copy keeps local previews working; the server keeps its own |
| `/stats` (visit counter) | box-side endpoint | Optional — dashboard hides the counter if absent |

**Deploy step:** after mirroring, `deploy.ps1` copies
`dist-hub\dash\index.html` onto `C:\srv\sites\projects\dash\index.html`
(overwriting only that file — assets stay as they are).

## Local preview

The dashboard only exists inside the **hub build output**, so it does not
work in `bun run dev` (the path falls back to the portfolio — see
[`development.md`](development.md)):

```bash
bun run build:hub
bun run preview:hub
# → http://localhost:4173/dash/
```

Locally, expect the box-only assets to 404 (GLB models show an empty
viewer, `comingsoon.html` 404s) — on the server they resolve.

## Tests

The hub SSR gate (`test/hub.render.test.ts`) renders `/dash/` in both
locales and asserts: header/tagline, a visit button **per `hubSites`
entry**, coming-soon links **per `soon` entry**, the profile card and its
buttons, the signature assets (`/dash/gwe.png`, a card GLB, FuruHibi's
WebUSB link), the About→portfolio link, and that dead legacy domains
never come back. Run it with the commands in
[`development.md`](development.md).

## History / future

- The dashboard used to be **standalone static HTML on the box**
  (`dash/` folder, written before this repo's hub existed). It was
  rebuilt as a hub page (commit *"Rebuild the dashboard as a hub page at
  /dash/"*) so it shares the theme, locales, and deploy pipeline.
- The apex domain **`nyaahibi.web.id`** originally served the portfolio;
  the portfolio moved to **`ulilhibi.my.id`**, freeing the apex — it now
  serves the **main-site landing** (`main.html`, the explainer for what
  NyaaHibi is about). The dashboard stays at
  `project.nyaahibi.web.id/dash/`; if a standalone dashboard ever needs
  its own domain (e.g. the apex pointing at `/dash/` instead), that's a
  Caddy + Cloudflare change only — the page already builds independently.
  If it ever needs **private secrets
  or a backend**, that's the trigger to move it to a separate private
  repo (see [`architecture.md`](architecture.md) → "Why not split").
