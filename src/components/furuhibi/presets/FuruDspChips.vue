<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DSP_FIELD_META, formatDspValue, type DspSettingEntry } from './presetsApi'

const props = defineProps<{ settings?: Record<string, DspSettingEntry> }>()

const { t } = useI18n()

/** Present DSP fields as value chips with an on/bypass badge (live layout). */
const chips = computed(() =>
  Object.entries(DSP_FIELD_META).flatMap(([key, meta]) => {
    const entry = props.settings?.[key]
    if (!entry) return []
    return [
      {
        key,
        label: meta.label,
        value: formatDspValue(key, entry),
        showState: meta.hasBypass,
        active: !entry.bypass,
      },
    ]
  }),
)
</script>

<template>
  <div class="mt-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
    <div
      v-for="chip in chips"
      :key="chip.key"
      class="rounded-lg border border-foreground/10 bg-muted/40 px-2.5 py-2"
    >
      <p class="mb-1 text-[11px] uppercase tracking-[0.03em] text-muted-foreground">
        {{ chip.label }}
      </p>
      <div class="flex items-baseline justify-between gap-1.5">
        <span class="text-sm font-semibold text-foreground">{{ chip.value }}</span>
        <span
          v-if="chip.showState"
          class="rounded px-1.5 py-px text-[10px]"
          :class="chip.active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'"
        >
          {{ chip.active ? t('furuhibi.presets.cards.on') : t('furuhibi.presets.cards.off') }}
        </span>
      </div>
    </div>
  </div>
</template>
