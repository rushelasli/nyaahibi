<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Menu, X } from '@lucide/vue'
import FuruNavMobile from './FuruNavMobile.vue'

const props = withDefaults(
  defineProps<{
    /** FuruHibi app URLs — hub passes relative paths, portfolio uses defaults. */
    dspHref?: string
    presetsHref?: string
    /** Companion-app download page (the Vue port of live download.html). */
    downloadHref?: string
    /** Prefix for in-page anchors — '' on the landing, '/furuhibi' on sub-pages. */
    anchorBase?: string
  }>(),
  {
    dspHref: 'https://project.nyaahibi.web.id/furuhibi/dsp.html',
    presetsHref: 'https://project.nyaahibi.web.id/furuhibi/preset.html',
    downloadHref: 'https://project.nyaahibi.web.id/furuhibi/download.html',
    anchorBase: '',
  },
)

const { t } = useI18n()

const open = ref(false)

/** Nav entries — section anchors resolve against the current entry's base. */
const links = computed(() => [
  { href: `${props.anchorBase}#products`, key: 'furuhibi.nav.products' },
  { href: `${props.anchorBase}#software`, key: 'furuhibi.nav.software' },
  { href: `${props.anchorBase}#dsp`, key: 'furuhibi.nav.dsp' },
  { href: props.downloadHref, key: 'furuhibi.nav.downloads' },
  { href: `${props.anchorBase}#about`, key: 'furuhibi.nav.about' },
])
</script>

<template>
  <!-- Sticky in-page nav — sits under the hub's own sticky header (h-16) -->
  <header class="sticky top-16 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur">
    <nav class="mx-auto flex h-12 max-w-5xl items-center justify-between px-5 md:px-8">
      <a
        :href="`${anchorBase}#top`"
        class="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        FuruHibi <span class="font-mono text-xs text-primary">古 日々</span>
      </a>

      <div class="hidden items-center gap-5 md:flex">
        <a
          v-for="link in links"
          :key="link.key"
          :href="link.href"
          class="font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >{{ t(link.key) }}</a
        >
        <div class="flex items-center gap-2">
          <a
            :href="dspHref"
            class="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
            >{{ t('furuhibi.nav.dsp') }}</a
          >
          <a
            :href="presetsHref"
            class="rounded-lg border border-foreground/15 px-3 py-1.5 text-[13px] font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
            >{{ t('furuhibi.nav.cloudPresets') }}</a
          >
        </div>
      </div>

      <button class="md:hidden" aria-label="Menu" @click="open = !open">
        <X v-if="open" class="h-5 w-5" />
        <Menu v-else class="h-5 w-5" />
      </button>
    </nav>

    <FuruNavMobile
      v-if="open"
      :links="links"
      :dsp-href="dspHref"
      :presets-href="presetsHref"
      @close="open = false"
    />
  </header>
</template>
