<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { hubSites, type HubSite } from '@/data/projects'

const { t } = useI18n()

/** All eight projects, in the curated order of the old dashboard. */
const cards = hubSites

/** The AMP card previews the logo instead of a GLB, as the old page did. */
const CARD_IMAGES: Record<string, string> = { nyaahibiamp: '/logo.png' }

function siteTitle(site: HubSite) {
  return t(`hub.sites.${site.slug}.title`)
}

function siteDesc(site: HubSite) {
  return t(`hub.sites.${site.slug}.desc`)
}

function visitHref(site: HubSite) {
  return site.status === 'live' ? `/${site.slug}` : '/dash/comingsoon.html'
}

onMounted(async () => {
  if (hubSites.some((s) => s.model)) {
    await import('@google/model-viewer')
  }
})
</script>

<template>
  <!-- Project cards — one per site, GLB preview where the old page had one -->
  <section class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <div class="grid gap-5 md:grid-cols-2">
        <article
          v-for="site in cards"
          :key="site.slug"
          class="flex flex-col overflow-hidden rounded-xl border border-foreground/10 bg-card transition-colors hover:border-foreground/20"
        >
          <model-viewer
            v-if="site.model"
            :src="site.model"
            class="block w-full"
            style="height: 240px"
            camera-controls
            exposure="0.8"
            shadow-intensity="1"
            environment-image="neutral"
          />
          <img
            v-else-if="CARD_IMAGES[site.slug]"
            :src="CARD_IMAGES[site.slug]"
            :alt="siteTitle(site)"
            class="h-60 w-full bg-muted object-contain p-10"
          />
          <div
            v-else
            class="h-60 w-full bg-muted/40"
            role="img"
            :aria-label="siteTitle(site)"
          />

          <div class="flex flex-1 flex-col p-5">
            <h2 class="text-xl font-semibold tracking-tight text-foreground">
              {{ siteTitle(site) }}
            </h2>
            <p class="mt-2 leading-relaxed text-muted-foreground">
              {{ siteDesc(site) }}
            </p>

            <!-- Buttons pinned to the card bottom, across every card -->
            <div class="mt-auto flex flex-wrap gap-2 pt-5">
              <a
                :href="visitHref(site)"
                class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
              >
                {{ t('dash.visit') }}
              </a>
              <a
                v-if="site.extra"
                :href="site.extra.href"
                class="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
              >
                {{ t('dash.visitDsp') }}
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
