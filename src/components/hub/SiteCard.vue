<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, ExternalLink } from '@lucide/vue'
import type { HubSite } from '@/data/projects'

const { t, tm } = useI18n()

const props = defineProps<{
  site: HubSite
  /** 1-based position shown as the card number. */
  index: number
  /** Where "See detail" points — relative (`/slug`) on the hub, absolute from the main site. */
  detailHref: string
  /** Also show the site's extra link (e.g. FuruHibi's WebUSB DSP panel). */
  showExtra?: boolean
}>()

function siteTitle() {
  return t(`hub.sites.${props.site.slug}.title`)
}

function siteDesc() {
  return t(`hub.sites.${props.site.slug}.desc`)
}

function siteTags() {
  return tm(`hub.sites.${props.site.slug}.tags`) as unknown as string[]
}
</script>

<template>
  <article
    class="flex flex-col rounded-xl border border-foreground/10 bg-card p-6 transition-colors hover:border-foreground/20"
  >
    <div class="flex items-baseline gap-4">
      <span class="font-mono text-[13px] text-subtle-foreground">
        {{ String(index + 1).padStart(2, '0') }}
      </span>
      <h3 class="text-xl font-semibold tracking-tight text-foreground">
        {{ siteTitle() }}
      </h3>
    </div>

    <p class="mt-3 leading-relaxed text-muted-foreground">
      {{ siteDesc() }}
    </p>

    <div class="mt-5 mb-5 flex flex-wrap gap-2">
      <span
        v-for="tag in siteTags()"
        :key="tag"
        class="rounded-full border border-foreground/10 px-3 py-1 font-mono text-xs text-muted-foreground"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Links sit on the same bottom line across every card; the
         chips' mb-5 keeps the divider clear when desc wraps to 2 lines -->
    <div class="mt-auto flex flex-wrap gap-2 border-t border-foreground/10 pt-5">
      <a
        :href="detailHref"
        class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-foreground"
      >
        <ArrowUpRight
          class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
        {{ t('hub.seeDetail') }}
      </a>
      <a
        v-if="showExtra && site.extra"
        :href="site.extra.href"
        target="_blank"
        rel="noopener noreferrer"
        class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-foreground/80 transition-colors hover:text-foreground"
      >
        <ExternalLink
          class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
        {{ site.extra.label }}
      </a>
    </div>
  </article>
</template>
