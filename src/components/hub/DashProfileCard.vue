<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ExternalLink } from '@lucide/vue'
import { PORTFOLIO_BASE } from '@/data/projects'

const { t } = useI18n()

const CHAT_HREF = 'https://www.facebook.com/share/1DikM81ymJ/'
</script>

<template>
  <!-- Profile — the creator card from the old dashboard -->
  <section class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <div class="rounded-xl border border-foreground/10 bg-card p-6">
        <h2 class="mb-4 text-xl font-semibold tracking-tight text-foreground">
          {{ t('dash.profileTitle') }}
        </h2>
        <div class="grid gap-6 md:grid-cols-[220px_1fr]">
          <img
            src="/dash/gwe.png"
            :alt="t('dash.profileTitle')"
            class="aspect-square w-full max-w-[220px] rounded-xl object-cover"
          />
          <div>
            <p class="leading-relaxed text-muted-foreground">
              {{ t('dash.profileBio1') }}
            </p>
            <p class="mt-3 leading-relaxed text-muted-foreground" v-html="t('dash.profileBio2')" />
            <div class="mt-5 flex flex-wrap gap-2">
              <a
                :href="`${PORTFOLIO_BASE}/#about`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
              >
                {{ t('dash.aboutBtn') }}
              </a>
              <a
                :href="CHAT_HREF"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
              >
                <ExternalLink class="h-4 w-4 text-primary" />
                {{ t('dash.chatBtn') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
