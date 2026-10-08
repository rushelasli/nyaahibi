/**
 * Single source of truth for the NyaaHibi sites hub: the domain
 * constants here and the `hubSites` registry below — which drives the
 * landing cards, the dashboard cards, the deploy script's live-slug
 * list, the per-slug HTML generation, and the test assertions.
 *
 * The portfolio (ulilhibi.my.id) lives in its own repository
 * (github.com/rushelasli/ulilhibi) and carries its own subset of this
 * registry (projectLinks + these two base URLs).
 */

/**
 * The self-hosted projects hub: home server behind a Cloudflare Tunnel,
 * one subdomain + path routing — every live site is a folder under it,
 * e.g. `https://project.nyaahibi.web.id/furuhibi`. Stays canonical in
 * code: PROJECTS_BASE feeds og:url heads, card links, and overlays.
 */
export const PROJECTS_BASE = 'https://project.nyaahibi.web.id'

/** The portfolio itself — pointed at by the hub's hero CTA and footer link. */
export const PORTFOLIO_BASE = 'https://ulilhibi.my.id'

/** One project site listed on the hub landing page. */
export interface HubSite {
  /** Path on the hub — the site is served at `${PROJECTS_BASE}/<slug>`. */
  slug: string
  /** `soon` sites render a badge and no visit link. */
  status: 'live' | 'soon'
  /** Extra link shown on the card (e.g. FuruHibi's WebUSB DSP panel). */
  extra?: { label: string; href: string }
  /** GLB previewed in the dashboard's 3D card viewer (box-hosted under /dash/). */
  model?: string
}

/** All sites shown on `project.nyaahibi.web.id` — order = curated order. */
export const hubSites: HubSite[] = [
  { slug: 'nyaahibiamp', status: 'live' },
  { slug: 'nyaahibiv2', status: 'live', model: '/dash/NyaaHibiV2.glb' },
  { slug: 'amahibi', status: 'soon' },
  { slug: 'microhibiamp', status: 'live', model: '/dash/MicroHibiAmp.glb' },
  { slug: 'nyaaop', status: 'soon', model: '/dash/MicroDiscreteOP.glb' },
  { slug: 'tubeseamp', status: 'live', model: '/dash/tubese.glb' },
  { slug: 'nyaatubefda', status: 'soon' },
  {
    slug: 'furuhibi',
    status: 'live',
    extra: { label: 'WebUSB DSP', href: '/furuhibi/dsp' },
  },
]
