<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { API_BASE, humanSize } from './downloadsApi'
import { useDownloadFiles } from './useDownloadFiles'

const props = defineProps<{
  name: string
  tag: string
  desc?: string
  /** API category path (windows_app/furuhibir2r, …). */
  category: string
}>()

const { t } = useI18n()
const { files, error, latest, older } = useDownloadFiles(props.category)
</script>

<template>
  <div class="flex flex-col rounded-2xl border border-foreground/10 bg-card p-5 md:p-6">
    <div class="mb-5 flex items-start justify-between gap-3">
      <h3 class="text-lg font-semibold text-foreground md:text-xl">{{ name }}</h3>
      <span
        class="shrink-0 rounded border border-foreground/20 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
        >{{ tag }}</span
      >
    </div>
    <p v-if="desc" class="-mt-3 mb-4 text-sm text-muted-foreground">{{ desc }}</p>

    <div
      v-if="error"
      class="rounded-lg border border-foreground/10 bg-muted/40 px-4 py-5 text-sm text-destructive"
    >
      {{ t('furuhibi.downloads.loadFail') + error }}
    </div>
    <div
      v-else-if="files === null"
      class="rounded-lg border border-foreground/10 bg-muted/40 px-4 py-5 text-center text-xs text-muted-foreground"
    >
      {{ t('furuhibi.downloads.loading') }}
    </div>
    <div
      v-else-if="files.length === 0"
      class="rounded-lg border border-foreground/10 bg-muted/40 px-4 py-5 text-center text-xs text-muted-foreground"
    >
      {{ t('furuhibi.downloads.empty') }}
    </div>

    <template v-else>
      <div
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-muted/40 px-4 py-4"
      >
        <div>
          <span class="mb-0.5 block text-xs text-muted-foreground">{{
            t('furuhibi.downloads.latestLabel')
          }}</span>
          <span class="break-all font-mono text-base text-primary">{{ latest!.name }}</span>
        </div>
        <a
          :href="API_BASE + latest!.url"
          download
          class="rounded bg-primary px-4 py-2 font-mono text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
        >
          {{ t('furuhibi.downloads.download', { size: humanSize(latest!.size) }) }}
        </a>
      </div>

      <details v-if="older.length" class="group mt-1">
        <summary
          class="flex cursor-pointer list-none items-center gap-2 py-2 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden"
        >
          <span class="w-3 text-primary">
            <span class="group-open:hidden">+</span>
            <span class="hidden group-open:inline">&#8211;</span>
          </span>
          {{ t('furuhibi.downloads.history') }}
        </summary>
        <div>
          <div
            v-for="f in older"
            :key="f.name"
            class="flex items-center justify-between gap-3 border-t border-foreground/10 px-2 py-4 text-sm"
          >
            <span class="break-all text-foreground/90">{{ f.name }}</span>
            <a
              :href="API_BASE + f.url"
              download
              class="shrink-0 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {{ t('furuhibi.downloads.download', { size: humanSize(f.size) }) }}
            </a>
          </div>
        </div>
      </details>
    </template>
  </div>
</template>
