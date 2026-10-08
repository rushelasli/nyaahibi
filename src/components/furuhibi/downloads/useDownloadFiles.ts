import { computed, onMounted, ref } from 'vue'
import { loadCategory, type DownloadFile } from './downloadsApi'

/** Fetches one download category's file list (latest first) on mount. */
export function useDownloadFiles(category: string) {
  const files = ref<DownloadFile[] | null>(null)
  const error = ref('')

  const latest = computed(() => files.value?.[0])
  const older = computed(() => files.value?.slice(1) ?? [])

  onMounted(async () => {
    try {
      files.value = await loadCategory(category)
    } catch (err) {
      error.value = (err as Error).message
    }
  })

  return { files, error, latest, older }
}
