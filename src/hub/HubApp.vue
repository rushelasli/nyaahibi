<script setup lang="ts">
import { computed, onMounted, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LocaleToggle from '@/components/LocaleToggle.vue'
import HubLanding from '@/hub/HubLanding.vue'
import MainLanding from '@/hub/MainLanding.vue'
import DashboardPage from '@/hub/DashboardPage.vue'
import { hubSites, PORTFOLIO_BASE, type HubSite } from '@/data/projects'
import AmpProject from '@/pages/AmpProject.vue'
import AmpGen1Project from '@/pages/AmpGen1Project.vue'
import MicroampProject from '@/pages/MicroampProject.vue'
import TubeSeProject from '@/pages/TubeSeProject.vue'
import FuruhibiProject from '@/pages/FuruhibiProject.vue'
import FuruhibiPresetsPage from '@/pages/FuruhibiPresetsPage.vue'
import FuruhibiDownloadPage from '@/pages/FuruhibiDownloadPage.vue'

const props = defineProps<{
  /** window.location.pathname — the hub has no router, so the entry
   *  passes the URL directly; "/" (or anything unknown) renders the landing. */
  initialPath?: string
  /** Which entry HTML mounted the app: "hub" (project.nyaahibi.web.id)
   *  renders the projects landing at the root, "main" (the apex
   *  nyaahibi.web.id interface) the explanatory landing. */
  site?: 'hub' | 'main'
}>()

const { t, locale } = useI18n()

const year = new Date().getFullYear()

const liveSites = computed(() => hubSites.filter((s) => s.status === 'live'))

interface DetailPage {
  comp: Component
  /** Extra props — the hub links the FuruHibi apps by relative path. */
  props?: Record<string, string>
}

/** Detail page per live slug — content pages reuse the portfolio sections. */
const detailPages: Record<string, DetailPage> = {
  nyaahibiamp: { comp: AmpGen1Project },
  nyaahibiv2: { comp: AmpProject },
  microhibiamp: { comp: MicroampProject },
  tubeseamp: { comp: TubeSeProject },
  furuhibi: {
    comp: FuruhibiProject,
    props: {
      dspHref: '/furuhibi/dsp',
      presetsHref: '/furuhibi/preset',
      downloadHref: '/furuhibi/download',
    },
  },
}

/** FuruHibi sub-pages — emitted as real folders beside the landing
 *  (dist-hub/furuhibi/{preset,download}/index.html) and routed by
 *  pathname exactly like the folder detail pages. Keys are the clean
 *  extensionless routes; detailPath also strips a legacy ".html". */
const subPages: Record<string, DetailPage> = {
  '/furuhibi/preset': {
    comp: FuruhibiPresetsPage,
    props: { dspHref: '/furuhibi/dsp', landingHref: '/furuhibi' },
  },
  '/furuhibi/download': {
    comp: FuruhibiDownloadPage,
    props: {
      dspHref: '/furuhibi/dsp',
      presetsHref: '/furuhibi/preset',
      downloadHref: '/furuhibi/download',
    },
  },
}

/** Locale key driving each sub-page's <title> (see vite.hub.config's heads). */
const subPageTitle: Record<string, string> = {
  '/furuhibi/preset': 'furuhibi.presets.metaTitle',
  '/furuhibi/download': 'furuhibi.downloads.metaTitle',
}

const detailPath = computed(() => {
  const raw = props.initialPath ?? '/'
  const cleaned = raw
    .replace(/\/index\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/\/+$/, '')
  return cleaned === '' ? '/' : cleaned
})

const detailSite = computed<HubSite | undefined>(() =>
  liveSites.value.find((s) => detailPath.value === `/${s.slug}`),
)

const detailEntry = computed<DetailPage | null>(() => {
  const site = detailSite.value
  if (!site) return null
  return detailPages[site.slug] ?? null
})

const subPage = computed<DetailPage | null>(() => subPages[detailPath.value] ?? null)

/** The rebuilt dashboard — vite.hub.config writes dist-hub/dash/index.html. */
const isDash = computed(() => detailPath.value === '/dash')

function syncDocumentMeta() {
  document.documentElement.lang = locale.value
  const detail = detailSite.value
  const subTitle = subPageTitle[detailPath.value]
  document.title = subTitle
    ? `${t(subTitle)} — ${t('hub.title')}`
    : isDash.value
      ? `${t('dash.metaTitle')} — ${t('hub.title')}`
      : detail
        ? `${t(`hub.sites.${detail.slug}.title`)} — ${t('hub.title')}`
        : props.site === 'main'
          ? t('main.metaTitle')
          : t('hub.metaTitle')
}

onMounted(syncDocumentMeta)
watch(locale, syncDocumentMeta)
</script>

<template>
  <div class="min-h-screen bg-background font-sans text-foreground/95 antialiased">
    <!-- Mascots stay pinned to the sides while scrolling; both face inward -->
    <img
      src="/maskotkiri.png"
      alt=""
      aria-hidden="true"
      class="pointer-events-none fixed bottom-0 left-0 z-0 hidden max-h-[70vh] max-w-[16vw] w-auto -scale-x-100 select-none object-contain object-bottom xl:block"
    />
    <img
      src="/maskotkanan.png"
      alt=""
      aria-hidden="true"
      class="pointer-events-none fixed bottom-0 right-0 z-0 hidden max-h-[70vh] max-w-[16vw] w-auto select-none object-contain object-bottom xl:block"
    />

    <div class="relative z-10 flex min-h-screen flex-col">
      <header class="sticky top-0 z-50 border-b border-foreground/10 bg-background/90 backdrop-blur">
        <nav class="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
          <a
            :href="PORTFOLIO_BASE"
            class="flex items-center gap-2 font-mono text-lg font-bold tracking-wider text-foreground"
          >
            <img src="/logo.png" alt="" class="h-7 w-7 object-contain" aria-hidden="true" />
            NYAAHIBI<span class="text-primary">.</span>
          </a>
          <div class="flex items-center gap-0.5 border-l border-foreground/10 pl-3">
            <ThemeToggle />
            <LocaleToggle />
          </div>
        </nav>
      </header>

      <!-- Dashboard at /dash/, FuruHibi sub-pages at /furuhibi/{preset,
           download}, detail page for the five live sites (back goes
           to the hub landing); anything else renders the landing —
           the explanatory main site when the entry says so, the projects
           landing otherwise -->
      <DashboardPage v-if="isDash" />
      <component
        v-else-if="subPage"
        :is="subPage.comp"
        :key="detailPath"
        v-bind="subPage.props"
      />
      <component
        v-else-if="detailEntry"
        :is="detailEntry.comp"
        :key="detailPath"
        v-bind="detailEntry.props"
        back-href="/"
      />
      <MainLanding v-else-if="site === 'main'" />
      <HubLanding v-else />

      <footer>
        <div
          class="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-5 py-8 text-sm text-subtle-foreground sm:flex-row sm:items-center md:px-8"
        >
          <a :href="PORTFOLIO_BASE" class="transition-colors hover:text-foreground">
            {{ t('hub.backToMain') }}
          </a>
          <span class="font-mono text-xs">© {{ year }} Ulil Albab · {{ t('footer.tagline') }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>
