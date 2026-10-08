<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { drawEqCurve } from './eqCurve'
import type { PeqBand } from './presetsApi'

const props = defineProps<{ bands?: PeqBand[] }>()

const { t } = useI18n()

const canvas = ref<HTMLCanvasElement | null>(null)
let resizeTimer: ReturnType<typeof setTimeout> | undefined

function draw() {
  if (canvas.value) drawEqCurve(canvas.value, props.bands, t('furuhibi.presets.cards.noBand'))
}

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(draw, 120)
}

onMounted(() => {
  requestAnimationFrame(draw)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="mt-3 rounded-lg border border-foreground/10 bg-muted/40 p-1.5">
    <canvas ref="canvas" class="block h-[160px] w-full"></canvas>
  </div>
</template>
