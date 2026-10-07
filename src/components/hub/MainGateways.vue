<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PORTFOLIO_BASE, PROJECTS_BASE } from '@/data/projects'
import SectionHeading from '@/components/hub/SectionHeading.vue'
import GatewayCard from '@/components/hub/GatewayCard.vue'

const { t } = useI18n()

/** The three places to go from the apex: catalog, dashboard, creator. */
const gateways = [
  { title: 'main.catalogTitle', desc: 'main.catalogDesc', href: PROJECTS_BASE },
  { title: 'main.dashTitle', desc: 'main.dashDesc', href: `${PROJECTS_BASE}/dash` },
  { title: 'main.creatorTitle', desc: 'main.creatorDesc', href: PORTFOLIO_BASE, external: true },
]
</script>

<template>
  <!-- Gateways — the three places to go from here -->
  <section id="main-gateways" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <SectionHeading :eyebrow="t('main.gatewayEyebrow')" :title="t('main.gatewayTitle')" />

      <div class="grid gap-5 md:grid-cols-3">
        <GatewayCard
          v-for="gateway in gateways"
          :key="gateway.title"
          :title="t(gateway.title)"
          :desc="t(gateway.desc)"
          :href="gateway.href"
          :external="gateway.external"
        />
      </div>
    </div>
  </section>
</template>
