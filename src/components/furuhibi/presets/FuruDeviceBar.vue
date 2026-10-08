<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFuruBle } from './bleDevice'

const { t } = useI18n()
const { connected, label, connect, disconnect } = useFuruBle()

const statusText = computed(() =>
  connected.value
    ? t('furuhibi.presets.device.connected', { name: label.value || 'FuruHibi R2R' })
    : t('furuhibi.presets.device.idle'),
)

function onConnect() {
  void connect({
    noBluetooth: t('furuhibi.presets.device.noBluetooth'),
    connectFail: t('furuhibi.presets.device.connectFail'),
  })
}
</script>

<template>
  <!-- Connection bar — one shared link feeds every card's Apply button -->
  <div
    class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-foreground/10 bg-card px-4 py-3.5"
  >
    <div class="flex items-center gap-2.5">
      <span
        class="h-2.5 w-2.5 shrink-0 rounded-full transition-colors"
        :class="connected ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted-foreground/50'"
      ></span>
      <span class="text-sm" :class="connected ? 'text-foreground' : 'text-muted-foreground'">
        {{ statusText }}
      </span>
    </div>
    <div class="flex gap-2">
      <button
        v-if="!connected"
        class="rounded-lg border border-primary/40 px-3.5 py-1.5 font-mono text-xs text-primary transition-colors hover:bg-primary/10"
        @click="onConnect"
      >
        {{ t('furuhibi.presets.device.connect') }}
      </button>
      <button
        v-else
        class="rounded-lg border border-destructive px-3.5 py-1.5 font-mono text-xs text-destructive transition-colors hover:bg-destructive/10"
        @click="disconnect"
      >
        {{ t('furuhibi.presets.device.disconnect') }}
      </button>
    </div>
  </div>
</template>
