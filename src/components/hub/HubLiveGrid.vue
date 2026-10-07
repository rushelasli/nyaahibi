<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { hubSites } from '@/data/projects'
import SectionHeading from '@/components/hub/SectionHeading.vue'
import SiteCard from '@/components/hub/SiteCard.vue'

const { t } = useI18n()

const liveSites = computed(() => hubSites.filter((s) => s.status === 'live'))
</script>

<template>
  <!-- Live sites — 2-column card grid -->
  <section id="live" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading :eyebrow="t('hub.liveEyebrow')" :title="t('hub.liveTitle')" />

      <div class="grid gap-5 md:grid-cols-2">
        <SiteCard
          v-for="(site, i) in liveSites"
          :key="site.slug"
          :site="site"
          :index="i"
          :detail-href="`/${site.slug}`"
          show-extra
        />
      </div>
    </div>
  </section>
</template>
