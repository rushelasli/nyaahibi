import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadDspPresets, loadPeqPresets, type DspPreset, type PeqPreset } from './presetsApi'

export type SectionState =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' }

/**
 * Loads both preset lists on mount and tracks the shared search box plus
 * each section's status (live behaviour: one query filters PEQ and DSP).
 */
export function usePresetLists() {
  const { t } = useI18n()

  const query = ref('')
  const peqList = ref<PeqPreset[]>([])
  const dspList = ref<DspPreset[]>([])
  const peqState = ref<SectionState>({ kind: 'loading' })
  const dspState = ref<SectionState>({ kind: 'loading' })

  function matches(name: string | undefined, author: string | undefined, q: string) {
    return (name || '').toLowerCase().includes(q) || (author || '').toLowerCase().includes(q)
  }

  const filteredPeq = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return peqList.value
    return peqList.value.filter((p) => matches(p.name, p.author, q))
  })

  const filteredDsp = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return dspList.value
    return dspList.value.filter((p) => matches(p.name, p.author, q))
  })

  const peqNoMatch = computed(
    () =>
      peqState.value.kind === 'ready' && peqList.value.length > 0 && filteredPeq.value.length === 0,
  )
  const dspNoMatch = computed(
    () =>
      dspState.value.kind === 'ready' && dspList.value.length > 0 && filteredDsp.value.length === 0,
  )

  /** Resolve a section's status line at render time (stays locale-reactive). */
  function statusOf(state: SectionState, which: 'peq' | 'dsp'): string | null {
    if (state.kind === 'loading') return t(`furuhibi.presets.${which}.loading`)
    if (state.kind === 'empty') return t(`furuhibi.presets.${which}.empty`)
    if (state.kind === 'error') return t(`furuhibi.presets.${which}.loadFail`) + state.message
    return null
  }

  async function loadAll() {
    try {
      const list = await loadPeqPresets()
      if (list.length === 0) peqState.value = { kind: 'empty' }
      else {
        peqList.value = list
        peqState.value = { kind: 'ready' }
      }
    } catch (err) {
      peqState.value = { kind: 'error', message: (err as Error).message }
    }
    try {
      const list = await loadDspPresets()
      if (list.length === 0) dspState.value = { kind: 'empty' }
      else {
        dspList.value = list
        dspState.value = { kind: 'ready' }
      }
    } catch (err) {
      dspState.value = { kind: 'error', message: (err as Error).message }
    }
  }

  onMounted(loadAll)

  return {
    query,
    peqState,
    dspState,
    filteredPeq,
    filteredDsp,
    peqNoMatch,
    dspNoMatch,
    statusOf,
  }
}
