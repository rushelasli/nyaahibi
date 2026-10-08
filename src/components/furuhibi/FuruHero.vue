<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    /**
     * Plain back href — set by the projects hub, which has no router.
     * When omitted, falls back to a router link back to the portfolio
     * project list (the default for the standalone portfolio app).
     */
    backHref?: string
    /**
     * DSP app URL. Defaults to the hub-hosted absolute URL (the retired
     * furuhibi subdomain is gone); the hub passes a relative path so
     * local previews don't jump to production.
     */
    dspHref?: string
  }>(),
  { dspHref: 'https://project.nyaahibi.web.id/furuhibi/dsp' },
)

const { t } = useI18n()
</script>

<template>
  <section class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
      <component
        :is="props.backHref ? 'a' : 'router-link'"
        v-bind="props.backHref ? { href: props.backHref } : { to: '/#projects' }"
        class="mb-8 inline-flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft class="h-3.5 w-3.5 text-primary" />
        {{ t('furuhibi.back') }}
      </component>

      <div>
        <p class="mb-4 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
          {{ t('furuhibi.headerEyebrow') }}
        </p>
        <p class="mb-3 font-mono text-[13px] text-subtle-foreground">
          {{ t('furuhibi.heroMark') }}
        </p>
        <h1
          class="mb-4 text-3xl font-semibold leading-[1.15] tracking-tight text-foreground md:text-4xl"
          v-html="t('furuhibi.heroTitle')"
        />
        <p class="max-w-lg text-[17px] leading-relaxed text-muted-foreground">
          {{ t('furuhibi.heroSub') }}
        </p>

        <div class="mt-7 flex flex-wrap gap-3">
          <a
            href="#products"
            class="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-[#7d6ef0]"
          >
            {{ t('furuhibi.ctaPrimary') }}
          </a>
          <a
            :href="dspHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center rounded-lg border border-foreground/15 px-5 py-2.5 text-[14px] font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {{ t('furuhibi.ctaSecondary') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
