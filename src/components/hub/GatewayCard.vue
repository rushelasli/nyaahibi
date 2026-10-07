<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, ExternalLink } from '@lucide/vue'

const { t } = useI18n()

defineProps<{
  /** Already-translated card title. */
  title: string
  /** Already-translated card body. */
  desc: string
  href: string
  /** External links get noopener attrs and the ExternalLink icon instead of the underline. */
  external?: boolean
}>()
</script>

<template>
  <article
    class="flex flex-col rounded-xl border border-foreground/10 bg-card p-6 transition-colors hover:border-foreground/20"
  >
    <h3 class="text-xl font-semibold tracking-tight text-foreground">
      {{ title }}
    </h3>
    <p class="mt-3 leading-relaxed text-muted-foreground">
      {{ desc }}
    </p>
    <div class="min-h-5 grow"></div>
    <div class="flex flex-wrap gap-2 border-t border-foreground/10 pt-5">
      <a
        v-if="external"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-foreground/80 transition-colors hover:text-foreground"
      >
        <ExternalLink
          class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
        {{ t('main.gatewayCta') }}
      </a>
      <a
        v-else
        :href="href"
        class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-foreground"
      >
        <ArrowUpRight
          class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
        {{ t('main.gatewayCta') }}
      </a>
    </div>
  </article>
</template>
