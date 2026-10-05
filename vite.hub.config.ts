import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'node:fs'
import { hubSites, PROJECTS_BASE } from './src/data/projects.ts'
import en from './src/locales/en.json' with { type: 'json' }

// Second entry: the projects-hub landing page served at
// https://project.nyaahibi.web.id (built separately into dist-hub/).

/** Per-page <head> values: crawlers see the right title/description
 *  before the SPA mounts (site titles are locale-neutral brand names,
 *  so English copy drives the metadata). */
interface PageHead {
  title: string
  desc: string
  url: string
}

function withHead(html: string, head: PageHead): string {
  const esc = (s: string) => s.replace(/"/g, '&quot;')
  const title = esc(head.title)
  const desc = esc(head.desc)
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${desc}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${desc}" />`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${head.url}" />`,
    )
}

function slugHead(slug: string): PageHead {
  const site = en.hub.sites[slug as keyof typeof en.hub.sites]
  return {
    title: `${site.title} — ${en.hub.title}`,
    desc: site.desc,
    url: `${PROJECTS_BASE}/${slug}`,
  }
}

/**
 * The hub has no router — every live project is a static folder
 * (dist-hub/<slug>/index.html) serving the same app; HubApp picks the
 * page from window.location.pathname. Mirroring hub.html into each live
 * slug folder keeps local previews (`vite preview`) identical to the
 * deployed layout. dist-hub/dash/index.html is the rebuilt dashboard
 * (deploy.ps1 overlays it onto the box's dash/ folder).
 */
function hubSlugPages(): Plugin {
  return {
    name: 'hub-slug-pages',
    closeBundle() {
      const outDir = path.resolve(import.meta.dirname, 'dist-hub')
      const html = fs.readFileSync(path.join(outDir, 'hub.html'), 'utf8')
      for (const site of hubSites.filter((s) => s.status === 'live')) {
        const dir = path.join(outDir, site.slug)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), withHead(html, slugHead(site.slug)))
      }
      const dashDir = path.join(outDir, 'dash')
      fs.mkdirSync(dashDir, { recursive: true })
      fs.writeFileSync(
        path.join(dashDir, 'index.html'),
        withHead(html, {
          title: `${en.dash.metaTitle} — ${en.hub.title}`,
          desc: en.dash.metaDesc,
          url: `${PROJECTS_BASE}/dash`,
        }),
      )
    },
  }
}

/**
 * Dev-only: in production every folder serves the same app's index.html
 * (dist-hub/<path>/), routed by window.location.pathname. The dev server
 * has no such folders, and its SPA fallback points at the PORTFOLIO
 * index.html — so any extensionless GET/HEAD path (/, /dash/, /<slug>/)
 * is rewritten to /hub.html here, before the fallback; HubApp then reads
 * the real pathname from location. Paths with a dot (modules, assets)
 * and Vite internals (/@…) pass through untouched.
 */
function hubDevRouter(): Plugin {
  return {
    name: 'hub-dev-router',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url
        if (!url || (req.method !== 'GET' && req.method !== 'HEAD')) return next()
        const pathname = url.split('?', 1)[0]
        if (pathname === '/hub.html' || pathname.startsWith('/@') || pathname.includes('.')) {
          return next()
        }
        const q = url.indexOf('?')
        req.url = q === -1 ? '/hub.html' : `/hub.html${url.slice(q)}`
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('model-viewer'),
        },
      },
    }),
    tailwindcss(),
    hubSlugPages(),
    hubDevRouter(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-hub',
    rollupOptions: {
      // hub.html = the projects landing (project.nyaahibi.web.id);
      // main.html = the explanatory apex interface (nyaahibi.web.id).
      input: {
        hub: path.resolve(import.meta.dirname, 'hub.html'),
        main: path.resolve(import.meta.dirname, 'main.html'),
      },
    },
  },
})
