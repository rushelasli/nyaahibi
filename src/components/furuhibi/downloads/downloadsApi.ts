/**
 * Download API client — app.nyaahibi.web.id is a separate origin from
 * wherever this page is hosted, so every fetch uses this absolute base
 * (same arrangement as the live site's download.html).
 */
export const API_BASE = 'https://app.nyaahibi.web.id'

export interface DownloadFile {
  name: string
  url: string
  size: number
}

/** Category paths, same order as the `furuhibi.downloads.cards` locale array. */
export const CATEGORIES = [
  'windows_app/furuhibir2r',
  'android_app/furuhibir2r',
  'firmware/furuhibir2r/main_fw',
  'firmware/furuhibir2r/bt_sink',
]

export function humanSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

export async function loadCategory(category: string): Promise<DownloadFile[]> {
  const res = await fetch(`${API_BASE}/api/downloads/${category}`)
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error || res.statusText)
  return data.files || []
}
