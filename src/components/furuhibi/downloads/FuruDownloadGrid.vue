<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FuruDownloadCard from './FuruDownloadCard.vue'
import { CATEGORIES } from './downloadsApi'

const { tm } = useI18n()

const cards = computed(
  () =>
    tm('furuhibi.downloads.cards') as unknown as {
      name: string
      tag: string
      desc?: string
    }[],
)
</script>

<template>
  <!-- 2×2 platform/firmware cards, filled from GET /api/downloads/<category> -->
  <div class="mt-14 grid gap-10 md:grid-cols-2">
    <FuruDownloadCard
      v-for="(card, i) in cards"
      :key="CATEGORIES[i]"
      :category="CATEGORIES[i]"
      :name="card.name"
      :tag="card.tag"
      :desc="card.desc"
    />
  </div>
</template>
