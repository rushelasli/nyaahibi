<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

interface SpecRow {
  label: string
  value: string
}

const { t, tm } = useI18n()

const specs = computed(() => tm('furuhibi.specs') as unknown as SpecRow[])

/** Same fullscreen behaviour as the live page's pcb-fullscreen-btn. */
function fullscreen() {
  const el = document.getElementById('pcb-viewer') as
    | (HTMLElement & { webkitRequestFullscreen?: () => void; msRequestFullscreen?: () => void })
    | null
  if (!el) return
  if (el.requestFullscreen) el.requestFullscreen()
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  else if (el.msRequestFullscreen) el.msRequestFullscreen()
}

onMounted(async () => {
  await import('@google/model-viewer')
})
</script>

<template>
  <!-- Specs + interactive PCB (model-viewer), like the live page's second #products -->
  <section id="specs" class="scroll-mt-32 border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
      <div class="grid items-center gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.15em] text-subtle-foreground">
            {{ t('furuhibi.productLabel') }}
          </p>
          <h3 class="mb-6 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {{ t('furuhibi.productTitle') }}
          </h3>

          <dl class="flex flex-col">
            <div
              v-for="spec in specs"
              :key="spec.label"
              class="flex items-center justify-between gap-4 border-b border-foreground/10 py-2.5"
            >
              <dt class="text-[14px] text-subtle-foreground">{{ spec.label }}</dt>
              <dd class="text-right font-mono text-[13px] text-foreground/90">
                {{ spec.value }}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <model-viewer
            id="pcb-viewer"
            src="/projects/furuhibi/FuruHibiPCB.glb"
            :alt="t('furuhibi.viewerAlt')"
            camera-controls
            auto-rotate
            rotation-per-second="18deg"
            shadow-intensity="0.6"
            exposure="1"
            camera-orbit="25deg 75deg 105%"
            class="block h-[360px] w-full bg-transparent md:h-[420px]"
          ></model-viewer>
          <button
            class="mt-3 block w-full text-center text-[13px] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            @click="fullscreen"
          >
            {{ t('furuhibi.fullscreen') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
