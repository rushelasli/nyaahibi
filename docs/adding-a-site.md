# Adding a project site to the hub

The workflow for making a new project live at
`project.nyaahibi.web.id/<slug>`. Follow the steps in order — the SSR
tests and the deploy script all derive from the same registry, so a
missing step fails loudly (that's intentional).

For the overall mechanics, see [`architecture.md`](architecture.md).

## The rule

**`src/data/projects.ts` is the single source of truth.** The landing
cards, dashboard cards, generated per-slug HTML, deploy overlay list, and
test expectations all read `hubSites`. Register the slug there first.

## Checklist

### 1. Register the slug

```ts
// src/data/projects.ts
export const hubSites: HubSite[] = [
  { slug: 'myslug', status: 'live' },       // or 'soon'
  // optional fields:
  //   model: '/dash/MyModel.glb',          → 3D preview on the dashboard card
  //   extra: { label: 'WebUSB DSP', href: '/myslug/dsp.html' },  → second button
]
```

`status: 'live'` means: gets a real visit link, a generated
`dist-hub/<slug>/index.html`, a deploy overlay, and test coverage.
`'soon'` renders a badge instead — and no link (the dashboard points soon
cards at `/dash/comingsoon.html`).

### 2. Add card copy (both locales)

```jsonc
// src/locales/en.json  AND  src/locales/id.json
"hub": {
  "sites": {
    "myslug": {
      "title": "MySlug",
      "desc": "One-line description shown on the card.",
      "tags": ["Tag 1", "Tag 2"]
    }
  }
}
```

Both files must stay at key parity — the tests render both locales and
fail on unresolved keys.

### 3. Give it a detail page

The page shown at `/<slug>/`:

1. Create `src/pages/MyProject.vue` (reuse the section components in
   `src/components/project/` — `ProjectHero`, `BlockDiagramSection`,
   `ProjectReferences`, …).
2. Register it in the `detailPages` map in `src/hub/HubApp.vue`:

   ```ts
   const detailPages: Record<string, DetailPage> = {
     // ...
     myslug: { comp: MyProject },
   }
   ```

3. Add its own locale namespace for the page content (`myslug.*` keys in
   both locale files) — or reuse an existing project namespace if it's a
   variant of an existing page.

The legacy `/projects/*` routes retired with the portfolio split — this
repo keeps only the hub's detail pages; the portfolio
([rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi)) links
out via its own `projectLinks` copy (step 5).

### 4. Add test coverage

`test/hub.render.test.ts` has two maps near the bottom:

```ts
const detailPages: Record<string, string> = {
  // slug: locale namespace used for assertions
  myslug: 'myslug',
}

const detailMarkers: Record<string, string> = {
  // one asset path ONLY this page renders — proves the page really rendered
  myslug: '/projects/myslug/something.png',
}
```

- A `live` slug **without** a `detailPages` entry → test fails
  (`live slug myslug has no detail-page test entry`).
- A detail page whose namespace isn't in the `KEY_LEAK` /
  `ATTR_KEY_LEAK` regexes (top of `test/hub.render.test.ts`) →
  unresolved i18n keys could slip through silently. Add the namespace to
  those regexes (the portfolio repo keeps its own copy of them).

Run the gate (see [`development.md`](development.md)):

```bash
bunx vite build --ssr test/hub.render.test.ts --outDir node_modules/.tmp/ssr-hub
node node_modules/.tmp/ssr-hub/hub.render.test.js
```

### 5. (Optional) Link it from the portfolio (other repo)

In [rushelasli/ulilhibi](https://github.com/rushelasli/ulilhibi):

```ts
// src/data/projects.ts — portfolio home card
projectLinks: {
  myslug: [{ label: 'project.nyaahibi.web.id/myslug', href: `${PROJECTS_BASE}/myslug` }],
}
```

Policy (enforced by that repo's `test/render.test.ts`): live projects
link to their hub detail page — the hub is the single front door.
Retired subdomains must never reappear in copy.

### 6. (Optional) Dashboard extras

- `model: '/dash/MyModel.glb'` — 3D preview on the dashboard card.
  **GLB files are box-side**: they live in
  `C:\srv\sites\projects\dash\`, not in this repo (the `/dash/` folder is
  excluded from every mirror). Upload the file there; the repo only
  references its path.
- The dashboard card image fallback (logo) is `CARD_IMAGES` in
  `src/hub/DashboardPage.vue`.

### 7. Server side (once)

One-time, on the homeserver (details in `ops/README.md`):

1. `C:\srv\repos\projects\myslug` = git clone of the project site.
2. `deploy.ps1` mirrors it to `C:\srv\sites\projects\myslug` on every run
   (folder name = URL path).
3. Cloudflare 301 from the old subdomain (if the site had one).

### 8. Deploy

```powershell
ops\deploy.ps1
```

What happens automatically (nothing to configure):

- `vite.hub.config.ts` generates `dist-hub/myslug/index.html` with the
  site's own `<title>`/description (from `en.hub.sites.myslug`).
- `deploy.ps1` derives the live-slug list from `hubSites` and overlays
  that `index.html` onto `C:\srv\sites\projects\myslug\index.html` —
  after the per-site mirror restored the site's own assets
  (`dsp.html`, downloads, images … stay untouched).

## Common failures

| Symptom | Cause |
| --- | --- |
| `live slug X has no detail-page test entry` | Step 4 missing |
| Unresolved key like `>hub.sites.x.title` in test output | Step 2 missing, or new namespace not in `KEY_LEAK` regex |
| Deploy warns `X skipped — source index.html or target folder missing` | Step 7 missing (no clone/folder on the box), or `status` not `live` |
| `/X/` on the hub serves the landing page | `detailPages` map in `HubApp.vue` missing the slug (step 3) |
| Dashboard card has no 3D model | `model` field missing (step 6) or GLB not uploaded box-side |
