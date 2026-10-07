<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hubSites } from '@/data/projects'
import SectionHeading from '@/components/hub/SectionHeading.vue'

const { t } = useI18n()

const soonSites = computed(() => hubSites.filter((s) => s.status === 'soon'))

function siteTitle(slug: string) {
  return t(`hub.sites.${slug}.title`)
}

function siteDesc(slug: string) {
  return t(`hub.sites.${slug}.desc`)
}
</script>

<template>
  <!-- Coming soon — one compact panel, not full cards -->
  <section id="soon" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading :eyebrow="t('hub.soonEyebrow')" :title="t('hub.soonTitle')" />

      <div class="rounded-xl border border-foreground/10 bg-card">
        <div
          v-for="site in soonSites"
          :key="site.slug"
          class="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 px-6 py-5 first:border-t-0"
        >
          <div class="min-w-0">
            <h3 class="text-base font-semibold text-foreground md:text-lg">
              {{ siteTitle(site.slug) }}
            </h3>
            <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
              {{ siteDesc(site.slug) }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full border border-primary/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary"
          >
            {{ t('hub.comingSoon') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
