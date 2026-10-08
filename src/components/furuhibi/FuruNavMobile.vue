<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  links: { href: string; key: string }[]
  dspHref: string
  presetsHref: string
}>()

defineEmits<{ close: [] }>()

const { t } = useI18n()
</script>

<template>
  <!-- Mobile dropdown panel — the toggle button stays in the nav row -->
  <div class="border-t border-foreground/10 px-5 py-3 md:hidden">
    <a
      v-for="link in links"
      :key="link.key"
      :href="link.href"
      class="block py-2 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      @click="$emit('close')"
      >{{ t(link.key) }}</a
    >
    <div class="mt-2 flex gap-2">
      <a
        :href="dspHref"
        class="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
        >{{ t('furuhibi.nav.openDsp') }}</a
      >
      <a
        :href="presetsHref"
        class="rounded-lg border border-foreground/15 px-3 py-1.5 text-[13px] font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-foreground/5"
        >{{ t('furuhibi.nav.cloudPresets') }}</a
      >
    </div>
  </div>
</template>
