import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFuruBle } from './bleDevice'
import { formatDate, type DspPreset, type PeqPreset } from './presetsApi'

export interface PresetCardProps {
  preset: PeqPreset | DspPreset
  variant: 'peq' | 'dsp'
  dspHref?: string
}

/** Card state: meta lines, apply-to-device status, and the two actions. */
export function usePresetCard(props: PresetCardProps) {
  const { t } = useI18n()
  const { connected, applyPeq, applyDsp } = useFuruBle()

  const status = ref('')
  const statusKind = ref<'' | 'ok' | 'err'>('')
  let statusTimer: ReturnType<typeof setTimeout> | undefined

  function showStatus(msg: string, kind: '' | 'ok' | 'err') {
    status.value = msg
    statusKind.value = kind
    clearTimeout(statusTimer)
    if (kind) {
      statusTimer = setTimeout(() => {
        status.value = ''
        statusKind.value = ''
      }, 3000)
    }
  }
  onUnmounted(() => clearTimeout(statusTimer))

  const metaLine = computed(() => `#${props.preset.id} · ${formatDate(props.preset.created_at)}`)
  const authorLine = computed(() =>
    props.preset.author
      ? t('furuhibi.presets.cards.byAuthor', { name: props.preset.author })
      : '',
  )

  function openInDsp() {
    const query = props.variant === 'peq' ? 'cloud_preset' : 'cloud_dsp_preset'
    const id = encodeURIComponent(String(props.preset.id))
    window.location.href = `${props.dspHref}?${query}=${id}`
  }

  async function applyToDevice() {
    statusKind.value = ''
    status.value = t('furuhibi.presets.apply.sending')
    try {
      if (props.variant === 'peq') await applyPeq(props.preset as PeqPreset)
      else await applyDsp(props.preset as DspPreset)
      showStatus(t('furuhibi.presets.apply.ok'), 'ok')
    } catch (err) {
      showStatus(t('furuhibi.presets.apply.fail') + (err as Error).message, 'err')
    }
  }

  return { connected, status, statusKind, metaLine, authorLine, openInDsp, applyToDevice }
}
