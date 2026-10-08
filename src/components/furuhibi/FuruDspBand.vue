<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    /**
     * DSP / Cloud Presets app URLs. Default to the hub-hosted absolute
     * URLs (the retired furuhibi subdomain is gone); the hub passes
     * relative paths so local previews don't jump to production.
     */
    dspHref?: string
    presetsHref?: string
  }>(),
  {
    dspHref: 'https://project.nyaahibi.web.id/furuhibi/dsp',
    presetsHref: 'https://project.nyaahibi.web.id/furuhibi/preset',
  },
)

const { t } = useI18n()
</script>

<template>
  <section id="dsp" class="scroll-mt-32 border-b border-foreground/10">
    <div class="mx-auto max-w-5xl md:px-8">
      <div class="grid md:grid-cols-2">
        <div class="border-b border-foreground/10 px-5 py-16 md:border-b-0 md:border-r md:py-20 md:pr-10">
          <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
            {{ t('furuhibi.dspEyebrow') }}
          </p>
          <h3 class="mb-4 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {{ t('furuhibi.dspTitle') }}
          </h3>
          <p class="mb-7 text-[15px] leading-relaxed text-muted-foreground">
            {{ t('furuhibi.dspDesc') }}
          </p>
          <a
            :href="dspHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-[#7d6ef0]"
          >
            {{ t('furuhibi.dspCta') }}
          </a>
        </div>

        <div class="px-5 py-16 md:py-20 md:pl-10">
          <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
            {{ t('furuhibi.presetsEyebrow') }}
          </p>
          <h3 class="mb-4 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {{ t('furuhibi.presetsTitle') }}
          </h3>
          <p class="mb-7 text-[15px] leading-relaxed text-muted-foreground">
            {{ t('furuhibi.presetsDesc') }}
          </p>
          <a
            :href="presetsHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-[#7d6ef0]"
          >
            {{ t('furuhibi.presetsCta') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
