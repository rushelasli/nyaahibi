/**
 * Cloud preset API client — app.nyaahibi.web.id is a separate origin from
 * wherever this page is hosted, so every fetch uses this absolute base
 * (same arrangement as the live site's preset.html).
 */
export const API_BASE = 'https://app.nyaahibi.web.id'

export interface PeqBand {
  type: number
  freq: number
  gain: number
  q: number
  bypass?: boolean
}

export interface PeqPreset {
  id: number
  name: string
  author: string
  created_at: string
  global_bypass?: boolean
  bands?: PeqBand[]
}

export interface DspSettingEntry {
  value: number
  bypass?: boolean
}

export interface DspPreset {
  id: number
  name: string
  author: string
  created_at: string
  settings?: Record<string, DspSettingEntry>
}

async function fetchOk(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`)
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error || res.statusText)
  return data
}

export async function loadPeqPresets(): Promise<PeqPreset[]> {
  const data = await fetchOk('/api/presets')
  return data.presets || []
}

export async function loadDspPresets(): Promise<DspPreset[]> {
  const data = await fetchOk('/api/dsp-presets')
  return data.presets || []
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

/** DSP preset fields — labels are technical (identical in both locales). */
export const DSP_FIELD_META: Record<
  string,
  { label: string; unit: string; signed?: boolean; hasBypass: boolean }
> = {
  pre_gain: { label: 'Pre-Gain', unit: ' dB', signed: true, hasBypass: true },
  master_volume: { label: 'Master Volume', unit: '%', hasBypass: false },
  loudness: { label: 'Loudness', unit: '%', hasBypass: true },
  stereo_width: { label: 'Stereo Width', unit: '%', hasBypass: true },
  surround: { label: 'Surround', unit: '%', hasBypass: true },
  reverb: { label: 'Reverb', unit: '%', hasBypass: true },
  spatial_clarity: { label: 'Spatial Clarity', unit: '%', hasBypass: true },
}

export function formatDspValue(key: string, entry: DspSettingEntry): string {
  const meta = DSP_FIELD_META[key]
  const value = Number(entry.value)
  const prefix = meta.signed && value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(meta.signed ? 1 : 0)}${meta.unit}`
}

/** BLE command prefixes per DSP field (Nordic UART, one-way writes). */
export const DSP_COMMAND_MAP: Record<string, { prefix: string; bypassPrefix?: string }> = {
  pre_gain: { prefix: 'GAIN', bypassPrefix: 'BGAIN' },
  master_volume: { prefix: 'VOL' },
  loudness: { prefix: 'LOUD', bypassPrefix: 'BLOUD' },
  stereo_width: { prefix: 'SEP', bypassPrefix: 'BSEP' },
  surround: { prefix: 'SURR', bypassPrefix: 'BSUR' },
  reverb: { prefix: 'REVB', bypassPrefix: 'BREV' },
  spatial_clarity: { prefix: 'CLARITY', bypassPrefix: 'BCLA' },
}
