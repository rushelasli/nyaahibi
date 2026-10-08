<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const ABOUT_LINK = 'https://adalahsaya.nyaahibi.web.id'
const CHAT_LINK = 'https://www.facebook.com/share/1DikM81ymJ/'
</script>

<template>
  <!-- About — creator photo, closing paragraphs, social row (from the live page) -->
  <section id="about" class="scroll-mt-32 border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
      <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('furuhibi.aboutEyebrow') }}
      </p>

      <div class="grid gap-8 md:grid-cols-[220px_1fr] md:gap-10">
        <img
          src="/projects/furuhibi/saia.png"
          :alt="t('furuhibi.aboutPhotoAlt')"
          class="w-full max-w-[220px] rounded-xl border border-foreground/10 object-cover"
          loading="lazy"
        />

        <div>
          <h2
            class="mb-5 max-w-[24ch] text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
          >
            {{ t('furuhibi.aboutTitle') }}
          </h2>

          <div class="max-w-3xl space-y-4 text-[16px] leading-relaxed text-muted-foreground">
            <p>{{ t('furuhibi.aboutP1') }}</p>
            <p>{{ t('furuhibi.aboutP2') }}</p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <a
              :href="ABOUT_LINK"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
            >
              {{ t('furuhibi.aboutSocialAbout') }}
            </a>
            <a
              :href="CHAT_LINK"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
            >
              {{ t('furuhibi.aboutSocialChat') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
