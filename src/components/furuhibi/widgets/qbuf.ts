import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * Quad Audio Buffer widget — the live site's JS ported to a composable.
 * Four buffers rotate through kosong → diisi → siap → diproses; arrows and
 * gauge fills follow the ring one step per tick.
 */

/** Gauge/border color per stage (same hexes as the live widget). */
export const QBUF_COLORS = ['#B4B2A9', '#639922', '#BA7517', '#D85A30']
/** Gauge fill height per stage, in %. */
export const QBUF_FILLS = [0, 100, 100, 0]

const FILL_DURATION = 2400
const ARROW_TRAVEL = 900

/** Buffer i sits in stage ((t − i) mod 4) — the ring rotates one step per tick. */
export function stagesFor(t: number): number[] {
  return Array.from({ length: 4 }, (_, i) => ((t - i) % 4 + 4) % 4)
}

export interface Qbuf {
  /** Stage index (0..3) per buffer. */
  stages: Ref<number[]>
  /** Which buffer the "in" arrow points at (stage 1 = diisi). */
  inIdx: Ref<number>
  /** Which buffer the "out" arrow points at (stage 3 = diproses). */
  outIdx: Ref<number>
  pulsing: Ref<boolean>
  /** Percent position of buffer i inside the 4-up grid (25i + 12.5%). */
  seg: (i: number) => string
}

export function useQbuf(): Qbuf {
  const initial = stagesFor(0)
  const stages = ref<number[]>(initial)
  const inIdx = ref(initial.indexOf(1))
  const outIdx = ref(initial.indexOf(3))
  const pulsing = ref(false)

  let tick = 0
  let t1: ReturnType<typeof setTimeout> | undefined
  let t2: ReturnType<typeof setTimeout> | undefined
  let t3: ReturnType<typeof setTimeout> | undefined

  function loop() {
    t1 = setTimeout(() => {
      tick++
      const next = stagesFor(tick)
      inIdx.value = next.indexOf(1)
      outIdx.value = next.indexOf(3)
      t2 = setTimeout(() => {
        stages.value = next
        pulsing.value = true
        t3 = setTimeout(() => (pulsing.value = false), 400)
        loop()
      }, ARROW_TRAVEL)
    }, FILL_DURATION)
  }

  onMounted(loop)
  onUnmounted(() => {
    clearTimeout(t1)
    clearTimeout(t2)
    clearTimeout(t3)
  })

  return { stages, inIdx, outIdx, pulsing, seg: (i) => `${25 * i + 12.5}%` }
}
