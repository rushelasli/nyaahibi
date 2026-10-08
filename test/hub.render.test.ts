// SSR render test for the projects-hub landing page (hub.html → dist-hub/).
// Run: bunx vite build --ssr test/hub.render.test.ts --outDir node_modules/.tmp/ssr-hub
//      && node node_modules/.tmp/ssr-hub/hub.render.test.js
await import('./stubs')

const { createSSRApp } = await import('vue')
const { renderToString } = await import('@vue/server-renderer')
const { default: i18n } = await import('@/i18n')
const { default: HubApp } = await import('@/hub/HubApp.vue')
const { hubSites, PORTFOLIO_BASE, PROJECTS_BASE } = await import('@/data/projects')

// Unresolved vue-i18n keys leak into the HTML as e.g. ">hub.title"
const KEY_LEAK = />(nav|hub|footer|common|meta|amp|microamp|furuhibi|ampgen1|tubese|dash|main)\.[a-zA-Z]/
// ... or into attribute values as e.g. alt="hub.sites.x"
const ATTR_KEY_LEAK = /"(nav|hub|footer|common|meta|amp|microamp|furuhibi|ampgen1|tubese|dash|main)\.[a-zA-Z]/

const outputs: Record<string, string> = {}
const failures: string[] = []

const liveSites = hubSites.filter((s) => s.status === 'live')
const soonSites = hubSites.filter((s) => s.status === 'soon')

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1
}

// Vue SSR escapes text/attribute content (&, <, >, ", ') — mirror it so
// expectations containing apostrophes (e.g. "Rod Elliot's") still match.
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function rendered(html: string, text: string): boolean {
  return html.includes(text) || html.includes(esc(text))
}

for (const locale of ['id', 'en'] as const) {
  try {
    i18n.global.locale.value = locale
    const app = createSSRApp(HubApp)
    app.use(i18n)

    const html = await renderToString(app)
    outputs[locale] = html

    if (html.length < 500) failures.push(`${locale}: suspiciously short render (${html.length} chars)`)

    const leak = html.match(KEY_LEAK)
    if (leak) failures.push(`${locale}: unresolved i18n key leaked -> ${leak[0]}`)
    const attrLeak = html.match(ATTR_KEY_LEAK)
    if (attrLeak) failures.push(`${locale}: unresolved key in attribute -> ${attrLeak[0]}`)

    // Brand chrome: logo, mascots staying fixed at the sides (left one flipped
    // to face inward), both toggles
    if (!html.includes('/logo.png')) failures.push(`${locale}: navbar logo missing`)
    if (!html.includes('/maskotkiri.png') || !html.includes('/maskotkanan.png')) {
      failures.push(`${locale}: mascot images missing`)
    }
    if (!html.includes('fixed bottom-0 left-0') || !html.includes('fixed bottom-0 right-0')) {
      failures.push(`${locale}: mascots not fixed to the sides`)
    }
    if (!html.includes('-scale-x-100')) failures.push(`${locale}: left mascot not flipped inward`)
    if (!rendered(html, i18n.global.t('nav.theme'))) failures.push(`${locale}: theme toggle missing`)
    if (!rendered(html, i18n.global.t('nav.languageToggle'))) {
      failures.push(`${locale}: language toggle missing`)
    }
    const flag = locale === 'id' ? '/flags/id.svg' : '/flags/gb.svg'
    if (!html.includes(flag)) failures.push(`${locale}: flag ${flag} missing`)

    // Hero section: tagline, title, stats line (interpolated from the
    // registry), and the browse CTA — flat, no starfield
    for (const id of ['hero', 'live', 'soon']) {
      if (!html.includes(`id="${id}"`)) failures.push(`${locale}: section #${id} missing`)
    }
    if (html.includes('<canvas')) failures.push(`${locale}: star-rain canvas still present`)
    if (!rendered(html, i18n.global.t('hub.eyebrow'))) failures.push(`${locale}: hub tagline missing`)
    if (!rendered(html, i18n.global.t('hub.title'))) failures.push(`${locale}: hub title missing`)
    const stats = i18n.global.t('hub.stats', { live: liveSites.length, soon: soonSites.length })
    if (!rendered(html, stats)) failures.push(`${locale}: stats line missing: ${stats}`)
    if (html.includes('{live}') || html.includes('{soon}')) {
      failures.push(`${locale}: stats interpolation leaked`)
    }
    if (!rendered(html, i18n.global.t('hub.ctaBrowse'))) failures.push(`${locale}: browse CTA missing`)
    if (!html.includes(`href="${PORTFOLIO_BASE}"`)) {
      failures.push(`${locale}: portfolio link (navbar/footer) missing`)
    }

    // Live section header + 2-column grid of cards
    if (!rendered(html, i18n.global.t('hub.liveEyebrow'))) failures.push(`${locale}: live eyebrow missing`)
    if (!rendered(html, i18n.global.t('hub.liveTitle'))) failures.push(`${locale}: live title missing`)
    if (!html.includes('md:grid-cols-2')) failures.push(`${locale}: 2-column live grid missing`)

    // Every live card ends in a "See detail" text link, pinned to the card
    // bottom by the flex-end footer (mt-auto); the chips' fixed mb-5 keeps
    // the divider clear even when a description wraps to 2 lines
    const seeDetail = i18n.global.t('hub.seeDetail')
    const detailCount = count(html, seeDetail)
    if (detailCount !== liveSites.length) {
      failures.push(`${locale}: expected ${liveSites.length} "See detail" links, found ${detailCount}`)
    }
    if (!html.includes('mt-auto')) failures.push(`${locale}: card link footer not flex-end`)
    if (!html.includes('mt-5 mb-5')) {
      failures.push(`${locale}: chip gap fix missing — divider would touch the tags`)
    }

    for (const site of liveSites) {
      if (!rendered(html, i18n.global.t(`hub.sites.${site.slug}.title`))) {
        failures.push(`${locale}: card title missing for ${site.slug}`)
      }
      if (!rendered(html, i18n.global.t(`hub.sites.${site.slug}.desc`))) {
        failures.push(`${locale}: card description missing for ${site.slug}`)
      }
      if (!html.includes(`href="/${site.slug}"`)) {
        failures.push(`${locale}: visit link missing for ${site.slug}`)
      }
      const tags = i18n.global.tm(`hub.sites.${site.slug}.tags`) as unknown as string[]
      for (const tag of tags ?? []) {
        if (!rendered(html, tag)) failures.push(`${locale}: tag chip missing for ${site.slug}: ${tag}`)
      }
      // Extra link is labeled from the registry, not a raw URL
      if (site.extra && !rendered(html, site.extra.label)) {
        failures.push(`${locale}: extra button label missing for ${site.slug}`)
      }
      // No raw hub URLs may be displayed anywhere on the cards
      if (html.includes(`project.nyaahibi.web.id/${site.slug}`)) {
        failures.push(`${locale}: raw URL label still displayed for ${site.slug}`)
      }
    }

    // Coming-soon section: compact panel — titles/descs, badges, no links
    if (!rendered(html, i18n.global.t('hub.soonEyebrow'))) failures.push(`${locale}: soon eyebrow missing`)
    if (!rendered(html, i18n.global.t('hub.soonTitle'))) failures.push(`${locale}: soon title missing`)
    for (const site of soonSites) {
      if (!rendered(html, i18n.global.t(`hub.sites.${site.slug}.title`))) {
        failures.push(`${locale}: soon title missing for ${site.slug}`)
      }
      if (!rendered(html, i18n.global.t(`hub.sites.${site.slug}.desc`))) {
        failures.push(`${locale}: soon description missing for ${site.slug}`)
      }
      if (html.includes(`href="/${site.slug}"`)) {
        failures.push(`${locale}: coming-soon site ${site.slug} must not have a visit link`)
      }
    }
    // Badges are the only elements using the primary-outlined chip class
    const badgeCount = count(html, 'border-primary/40')
    if (badgeCount !== soonSites.length) {
      failures.push(`${locale}: expected ${soonSites.length} coming-soon badges, found ${badgeCount}`)
    }

    // The old "details → portfolio" duality is gone: no portfolio project
    // pages may be linked from the hub cards
    if (html.includes(`${PORTFOLIO_BASE}/projects/`)) {
      failures.push(`${locale}: stale portfolio detail link (/projects/) rendered on the hub`)
    }

    // The hub lives on the singular subdomain — the plural must never appear
    if (html.includes('projects.nyaahibi.web.id')) {
      failures.push(`${locale}: stale plural subdomain projects.nyaahibi.web.id present`)
    }

    // The retired furuhibi subdomain must not appear anywhere on the hub
    if (html.includes('furuhibi.nyaahibi.web.id')) {
      failures.push(`${locale}: retired furuhibi subdomain still linked`)
    }

    // Footer points back to the portfolio
    if (!html.includes(PORTFOLIO_BASE)) failures.push(`${locale}: portfolio link missing in footer`)
    if (!rendered(html, i18n.global.t('hub.backToMain'))) {
      failures.push(`${locale}: back-to-main link missing`)
    }
  } catch (e) {
    failures.push(`${locale}: THREW ${(e as Error).stack ?? e}`)
  }
}

// ---------------------------------------------------------------------------
// Detail pages — /<slug>/ serves the same app; HubApp picks the composer
// from window.location (passed in as initialPath). Each live slug renders
// its content page inside the shared chrome with a plain back link to "/".
const detailPages: Record<string, string> = {
  nyaahibiamp: 'ampgen1',
  nyaahibiv2: 'amp',
  microhibiamp: 'microamp',
  tubeseamp: 'tubese',
  furuhibi: 'furuhibi',
}

// One content marker per page — an asset path only that page renders.
const detailMarkers: Record<string, string> = {
  nyaahibiamp: '/projects/nyaahibiamp/block_amp.png',
  nyaahibiv2: '/projects/amp/TopologiAmp.png',
  microhibiamp: '/projects/microamp/maskot.jpg',
  tubeseamp: '/projects/tubeseamp/tubese.glb',
  furuhibi: '/furuhibi/dsp',
}

const detailOutputs: Record<string, string> = {}

// Every live site must have a detail-page test entry (and therefore a
// composer in HubApp's detailPages — without one the landing fallback
// would quietly hide the miss at /<slug>/)
for (const site of liveSites) {
  if (!(site.slug in detailPages)) {
    failures.push(`live slug ${site.slug} has no detail-page test entry`)
  }
}

for (const [slug, ns] of Object.entries(detailPages)) {
  for (const locale of ['id', 'en'] as const) {
    const tag = `${slug}:${locale}`
    try {
      i18n.global.locale.value = locale
      const app = createSSRApp(HubApp, { initialPath: `/${slug}/` })
      app.use(i18n)

      const html = await renderToString(app)
      detailOutputs[tag] = html

      if (html.length < 500) failures.push(`${tag}: suspiciously short render (${html.length} chars)`)

      const leak = html.match(KEY_LEAK)
      if (leak) failures.push(`${tag}: unresolved i18n key leaked -> ${leak[0]}`)
      const attrLeak = html.match(ATTR_KEY_LEAK)
      if (attrLeak) failures.push(`${tag}: unresolved key in attribute -> ${attrLeak[0]}`)

      // Shared chrome survives the page swap
      if (!html.includes('/logo.png')) failures.push(`${tag}: navbar logo missing`)
      if (!html.includes('/maskotkiri.png') || !html.includes('/maskotkanan.png')) {
        failures.push(`${tag}: mascot images missing`)
      }
      if (!rendered(html, i18n.global.t('nav.theme'))) failures.push(`${tag}: theme toggle missing`)
      if (!rendered(html, i18n.global.t('nav.languageToggle'))) {
        failures.push(`${tag}: language toggle missing`)
      }

      // Back link is a plain anchor to the hub landing (no router here)
      if (!html.includes('href="/"')) failures.push(`${tag}: back-to-hub link missing`)
      if (!rendered(html, i18n.global.t(`${ns}.back`))) failures.push(`${tag}: back label missing`)

      // Content: this page's about copy + its signature asset.
      // The FuruHibi landing has no About section — the developer profile
      // at the bottom was dropped on purpose.
      if (slug === 'furuhibi') {
        if (html.includes('id="about"')) failures.push(`${tag}: About section must not render`)
      } else if (!rendered(html, i18n.global.t(`${ns}.aboutTitle`))) {
        failures.push(`${tag}: about title missing`)
      }
      if (!html.includes(detailMarkers[slug])) {
        failures.push(`${tag}: signature asset missing: ${detailMarkers[slug]}`)
      }

      // The landing itself must NOT render on a detail page
      if (html.includes('id="hero"') || html.includes('id="live"')) {
        failures.push(`${tag}: landing sections rendered on detail page`)
      }

      // The retired furuhibi subdomain — the hub links its apps locally
      if (html.includes('furuhibi.nyaahibi.web.id')) {
        failures.push(`${tag}: retired furuhibi subdomain still linked`)
      }

      // Dead first-gen domain — the V2 page's about link points at the hub
      if (html.includes('nyaahibi.nggonku.web.id')) {
        failures.push(`${tag}: dead nggonku link still present`)
      }
    } catch (e) {
      failures.push(`${tag}: THREW ${(e as Error).stack ?? e}`)
    }
  }
}

// Fallback: a soon slug (or any unknown path) serves the landing itself
try {
  i18n.global.locale.value = 'id'
  const app = createSSRApp(HubApp, { initialPath: '/amahibi/' })
  app.use(i18n)
  const html = await renderToString(app)
  if (!html.includes('id="hero"')) failures.push('soon slug /amahibi: landing hero missing (fallback broken)')
  if (html.includes('href="/amahibi"')) failures.push('soon slug /amahibi: must not be linked from the cards')
} catch (e) {
  failures.push(`soon slug fallback: THREW ${(e as Error).stack ?? e}`)
}

// ---------------------------------------------------------------------------
// FuruHibi sub-pages — /furuhibi/{preset,download} are emitted as
// folders beside the landing and route through the same app by pathname.
// One content marker per page: copy only that page renders.
const subPageTests: Record<string, { path: string; marker: string }> = {
  'furuhibi-preset': {
    path: '/furuhibi/preset',
    marker: 'furuhibi.presets.device.connect', // "🔗 Connect Device"
  },
  'furuhibi-download': {
    path: '/furuhibi/download',
    marker: 'furuhibi.downloads.heading', // "Companion app untuk Windows dan Android."
  },
}

for (const [key, spec] of Object.entries(subPageTests)) {
  for (const locale of ['id', 'en'] as const) {
    const tag = `${key}:${locale}`
    try {
      i18n.global.locale.value = locale
      const app = createSSRApp(HubApp, { initialPath: spec.path })
      app.use(i18n)

      const html = await renderToString(app)
      detailOutputs[tag] = html

      if (html.length < 500) failures.push(`${tag}: suspiciously short render (${html.length} chars)`)

      const leak = html.match(KEY_LEAK)
      if (leak) failures.push(`${tag}: unresolved i18n key leaked -> ${leak[0]}`)
      const attrLeak = html.match(ATTR_KEY_LEAK)
      if (attrLeak) failures.push(`${tag}: unresolved key in attribute -> ${attrLeak[0]}`)

      // Shared chrome survives the page swap
      if (!html.includes('/logo.png')) failures.push(`${tag}: navbar logo missing`)
      if (!rendered(html, i18n.global.t('nav.theme'))) failures.push(`${tag}: theme toggle missing`)
      if (!rendered(html, i18n.global.t('nav.languageToggle'))) {
        failures.push(`${tag}: language toggle missing`)
      }

      // Page content + links back into the FuruHibi app
      if (!rendered(html, i18n.global.t(spec.marker))) failures.push(`${tag}: content marker missing`)
      if (!html.includes('href="/furuhibi/dsp"')) failures.push(`${tag}: DSP app link missing`)
      const backToLanding = html.includes('href="/furuhibi"') || html.includes('href="/furuhibi#')
      if (!backToLanding) failures.push(`${tag}: landing back link missing`)

      // The landing itself must NOT render on a sub-page
      if (html.includes('id="hero"') || html.includes('id="live"')) {
        failures.push(`${tag}: landing sections rendered on sub-page`)
      }

      // The download page's nav anchors must be rebased to the landing
      if (key === 'furuhibi-download' && !html.includes('href="/furuhibi#products"')) {
        failures.push(`${tag}: nav anchors not rebased to the landing`)
      }

      if (html.includes('furuhibi.nyaahibi.web.id')) {
        failures.push(`${tag}: retired furuhibi subdomain still linked`)
      }
    } catch (e) {
      failures.push(`${tag}: THREW ${(e as Error).stack ?? e}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Dashboard — /dash/ renders the rebuilt dashboard (cards, profile, clock)
// on the shared hub chrome
for (const locale of ['id', 'en'] as const) {
  const tag = `dash:${locale}`
  try {
    i18n.global.locale.value = locale
    const app = createSSRApp(HubApp, { initialPath: '/dash/' })
    app.use(i18n)

    const html = await renderToString(app)
    detailOutputs[tag] = html

    if (html.length < 500) failures.push(`${tag}: suspiciously short render (${html.length} chars)`)

    const leak = html.match(KEY_LEAK)
    if (leak) failures.push(`${tag}: unresolved i18n key leaked -> ${leak[0]}`)
    const attrLeak = html.match(ATTR_KEY_LEAK)
    if (attrLeak) failures.push(`${tag}: unresolved key in attribute -> ${attrLeak[0]}`)

    // Shared chrome survives the page swap
    if (!html.includes('/logo.png')) failures.push(`${tag}: navbar logo missing`)
    if (!rendered(html, i18n.global.t('nav.theme'))) failures.push(`${tag}: theme toggle missing`)
    if (!rendered(html, i18n.global.t('nav.languageToggle'))) failures.push(`${tag}: language toggle missing`)

    // Header, every project card, and the profile card
    if (!rendered(html, i18n.global.t('dash.title'))) failures.push(`${tag}: dash header missing`)
    if (!rendered(html, i18n.global.t('dash.subtitle'))) failures.push(`${tag}: dash tagline missing`)
    if (!html.includes('href="/"')) failures.push(`${tag}: back-to-landing link missing`)
    const visit = i18n.global.t('dash.visit')
    const visitCount = count(html, visit)
    if (visitCount !== hubSites.length) {
      failures.push(`${tag}: expected ${hubSites.length} visit buttons, found ${visitCount}`)
    }
    if (!rendered(html, i18n.global.t('dash.profileTitle'))) failures.push(`${tag}: profile card missing`)
    if (!rendered(html, i18n.global.t('dash.aboutBtn'))) failures.push(`${tag}: about button missing`)
    if (!rendered(html, i18n.global.t('dash.chatBtn'))) failures.push(`${tag}: chat button missing`)

    // Signature assets: profile photo, a card GLB, FuruHibi's WebUSB panel
    if (!html.includes('/dash/gwe.png')) failures.push(`${tag}: profile photo missing`)
    if (!html.includes('/dash/NyaaHibiV2.glb')) failures.push(`${tag}: card GLB preview missing`)
    if (!html.includes('href="/furuhibi/dsp"')) failures.push(`${tag}: WebUSB link missing`)

    // About goes to the portfolio; the FB chat link stays as-is
    if (!html.includes(`href="${PORTFOLIO_BASE}/#about"`)) {
      failures.push(`${tag}: about link must point at the portfolio`)
    }
    if (!html.includes('facebook.com/share/1DikM81ymJ')) {
      failures.push(`${tag}: FB chat link missing`)
    }

    // Soon cards open the shared coming-soon page, not their own slug
    const soonCount = count(html, 'href="/dash/comingsoon.html"')
    if (soonCount !== soonSites.length) {
      failures.push(`${tag}: expected ${soonSites.length} coming-soon links, found ${soonCount}`)
    }

    // The landing must not render on /dash/
    if (html.includes('id="hero"')) failures.push(`${tag}: landing hero rendered on dash`)

    // Dead links from the old page must not come back
    if (html.includes('nggonku')) failures.push(`${tag}: dead nggonku link still present`)
    if (html.includes('furuhibi.nyaahibi.web.id')) failures.push(`${tag}: retired furuhibi subdomain still linked`)
  } catch (e) {
    failures.push(`${tag}: THREW ${(e as Error).stack ?? e}`)
  }
}

// ---------------------------------------------------------------------------
// Main site — the apex (nyaahibi.web.id) interface: site=main renders the
// explanatory landing at the root, on the shared hub chrome, with gateways
// out to the hub, the dashboard, and the portfolio.
for (const locale of ['id', 'en'] as const) {
  const tag = `main:${locale}`
  try {
    i18n.global.locale.value = locale
    const app = createSSRApp(HubApp, { initialPath: '/', site: 'main' })
    app.use(i18n)

    const html = await renderToString(app)
    detailOutputs[tag] = html

    if (html.length < 500) failures.push(`${tag}: suspiciously short render (${html.length} chars)`)

    const leak = html.match(KEY_LEAK)
    if (leak) failures.push(`${tag}: unresolved i18n key leaked -> ${leak[0]}`)
    const attrLeak = html.match(ATTR_KEY_LEAK)
    if (attrLeak) failures.push(`${tag}: unresolved key in attribute -> ${attrLeak[0]}`)

    // Shared chrome survives the page swap
    if (!html.includes('/logo.png')) failures.push(`${tag}: navbar logo missing`)
    if (!rendered(html, i18n.global.t('nav.theme'))) failures.push(`${tag}: theme toggle missing`)
    if (!rendered(html, i18n.global.t('nav.languageToggle'))) failures.push(`${tag}: language toggle missing`)

    // Explainer copy, section by section
    if (!html.includes('id="main-hero"')) failures.push(`${tag}: hero section missing`)
    if (!rendered(html, i18n.global.t('main.intro'))) failures.push(`${tag}: intro copy missing`)
    if (!html.includes('id="main-about"')) failures.push(`${tag}: about section missing`)
    if (!rendered(html, i18n.global.t('main.aboutP1'))) failures.push(`${tag}: about paragraph 1 missing`)
    if (!html.includes('id="main-gateways"')) failures.push(`${tag}: gateways section missing`)
    if (!html.includes('id="main-featured"')) failures.push(`${tag}: featured section missing`)

    // The three gateways: hub catalog, dashboard, portfolio
    if (!html.includes(`href="${PROJECTS_BASE}"`)) failures.push(`${tag}: catalog gateway missing`)
    if (!html.includes(`href="${PROJECTS_BASE}/dash"`)) failures.push(`${tag}: dashboard gateway missing`)
    if (!html.includes(`href="${PORTFOLIO_BASE}"`)) failures.push(`${tag}: portfolio gateway missing`)
    if (!rendered(html, i18n.global.t('main.catalogTitle'))) failures.push(`${tag}: catalog card missing`)
    if (!rendered(html, i18n.global.t('main.dashTitle'))) failures.push(`${tag}: dash card missing`)
    if (!rendered(html, i18n.global.t('main.creatorTitle'))) failures.push(`${tag}: creator card missing`)

    // Featured cards link to the hub (absolute), not relative slugs
    if (!rendered(html, i18n.global.t('main.featuredTitle'))) failures.push(`${tag}: featured title missing`)
    for (const site of hubSites.filter((s) => s.status === 'live')) {
      if (!html.includes(`href="${PROJECTS_BASE}/${site.slug}"`)) {
        failures.push(`${tag}: featured link for ${site.slug} missing`)
      }
    }

    // Neither landing takes over the main page, and no dead links return
    if (html.includes('id="hero"')) failures.push(`${tag}: hub landing rendered on the main site`)
    if (html.includes('id="live"')) failures.push(`${tag}: hub project grid rendered on the main site`)
    if (html.includes('nggonku')) failures.push(`${tag}: dead nggonku link still present`)
    if (html.includes('furuhibi.nyaahibi.web.id')) failures.push(`${tag}: retired furuhibi subdomain still linked`)
  } catch (e) {
    failures.push(`${tag}: THREW ${(e as Error).stack ?? e}`)
  }
}

// Every render must link the furuhibi apps by their clean routes —
// no internal .html href may survive anywhere.
for (const [tag, html] of [...Object.entries(outputs), ...Object.entries(detailOutputs)]) {
  const leak = html.match(/href="\/furuhibi\/[^"]*\.html"/)
  if (leak) failures.push(`${tag}: legacy .html furuhibi link rendered -> ${leak[0]}`)
}

// Per page, the two locales must produce genuinely different HTML
for (const slug of [
  ...Object.keys(detailPages),
  ...Object.keys(subPageTests),
  'dash',
  'main',
]) {
  const idHtml = detailOutputs[`${slug}:id`]
  const enHtml = detailOutputs[`${slug}:en`]
  if (idHtml && enHtml && idHtml === enHtml) {
    failures.push(`${slug}: id and en rendered IDENTICAL html`)
  }
}

// The two locales must produce genuinely different HTML
if (outputs.id && outputs.en && outputs.id === outputs.en) {
  failures.push('id and en rendered IDENTICAL html')
}

console.log('hub locales rendered:', Object.keys(outputs).length)
console.log('detail renders:', Object.keys(detailOutputs).length)
for (const k of Object.keys(outputs)) console.log(`  ${k}: ${outputs[k].length} chars`)
console.log(failures.length ? '\nFAILURES:\n' + failures.join('\n') : '\nALL HUB RENDER CHECKS PASSED')
process.exit(failures.length ? 1 : 0)
