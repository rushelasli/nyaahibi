<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, ArrowUpRight, ExternalLink } from '@lucide/vue'
import { hubSites, PORTFOLIO_BASE, PROJECTS_BASE, type HubSite } from '@/data/projects'

const { t, tm } = useI18n()

const liveSites = computed(() => hubSites.filter((s) => s.status === 'live'))

function siteTitle(site: HubSite) {
  return t(`hub.sites.${site.slug}.title`)
}

function siteDesc(site: HubSite) {
  return t(`hub.sites.${site.slug}.desc`)
}

function siteTags(site: HubSite): string[] {
  return tm(`hub.sites.${site.slug}.tags`) as unknown as string[]
}

function scrollToGateways() {
  document.getElementById('main-gateways')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <!-- Hero — flat, single-column: tagline → name → what this site is → CTA -->
  <section id="main-hero" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <p class="mb-4 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('hub.eyebrow') }}
      </p>
      <h1
        class="mb-5 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-5xl"
      >
        NyaaHibi
      </h1>
      <p class="mb-8 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
        {{ t('main.intro') }}
      </p>
      <button
        class="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#5a4bd1]"
        @click="scrollToGateways"
      >
        <ArrowDown class="h-4 w-4" />
        {{ t('main.heroCta') }}
      </button>
    </div>
  </section>

  <!-- About — what the site is, in two short paragraphs -->
  <section id="main-about" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('main.aboutEyebrow') }}
      </p>
      <h2 class="mb-8 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {{ t('main.aboutTitle') }}
      </h2>
      <div class="max-w-2xl space-y-4 text-[17px] leading-relaxed text-muted-foreground">
        <p>{{ t('main.aboutP1') }}</p>
        <p>{{ t('main.aboutP2') }}</p>
      </div>
    </div>
  </section>

  <!-- Gateways — the three places to go from here -->
  <section id="main-gateways" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('main.gatewayEyebrow') }}
      </p>
      <h2 class="mb-10 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {{ t('main.gatewayTitle') }}
      </h2>

      <div class="grid gap-5 md:grid-cols-3">
        <article
          class="flex flex-col rounded-xl border border-foreground/10 bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <h3 class="text-xl font-semibold tracking-tight text-foreground">
            {{ t('main.catalogTitle') }}
          </h3>
          <p class="mt-3 leading-relaxed text-muted-foreground">
            {{ t('main.catalogDesc') }}
          </p>
          <div class="min-h-5 grow"></div>
          <div class="flex flex-wrap gap-2 border-t border-foreground/10 pt-5">
            <a
              :href="PROJECTS_BASE"
              class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-foreground"
            >
              <ArrowUpRight
                class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
              {{ t('main.gatewayCta') }}
            </a>
          </div>
        </article>

        <article
          class="flex flex-col rounded-xl border border-foreground/10 bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <h3 class="text-xl font-semibold tracking-tight text-foreground">
            {{ t('main.dashTitle') }}
          </h3>
          <p class="mt-3 leading-relaxed text-muted-foreground">
            {{ t('main.dashDesc') }}
          </p>
          <div class="min-h-5 grow"></div>
          <div class="flex flex-wrap gap-2 border-t border-foreground/10 pt-5">
            <a
              :href="`${PROJECTS_BASE}/dash`"
              class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-foreground"
            >
              <ArrowUpRight
                class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
              {{ t('main.gatewayCta') }}
            </a>
          </div>
        </article>

        <article
          class="flex flex-col rounded-xl border border-foreground/10 bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <h3 class="text-xl font-semibold tracking-tight text-foreground">
            {{ t('main.creatorTitle') }}
          </h3>
          <p class="mt-3 leading-relaxed text-muted-foreground">
            {{ t('main.creatorDesc') }}
          </p>
          <div class="min-h-5 grow"></div>
          <div class="flex flex-wrap gap-2 border-t border-foreground/10 pt-5">
            <a
              :href="PORTFOLIO_BASE"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-foreground/80 transition-colors hover:text-foreground"
            >
              <ExternalLink
                class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
              {{ t('main.gatewayCta') }}
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Featured — a taste of the registry, every card links to the hub -->
  <section id="main-featured" class="border-b border-foreground/10">
    <div class="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <p class="mb-3 font-mono text-[13px] uppercase tracking-[0.2em] text-primary">
        {{ t('main.featuredEyebrow') }}
      </p>
      <h2 class="mb-10 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {{ t('main.featuredTitle') }}
      </h2>

      <div class="grid gap-5 md:grid-cols-2">
        <article
          v-for="(site, i) in liveSites"
          :key="site.slug"
          class="flex flex-col rounded-xl border border-foreground/10 bg-card p-6 transition-colors hover:border-foreground/20"
        >
          <div class="flex items-baseline gap-4">
            <span class="font-mono text-[13px] text-subtle-foreground">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <h3 class="text-xl font-semibold tracking-tight text-foreground">
              {{ siteTitle(site) }}
            </h3>
          </div>

          <p class="mt-3 leading-relaxed text-muted-foreground">
            {{ siteDesc(site) }}
          </p>

          <div class="mt-5 mb-5 flex flex-wrap gap-2">
            <span
              v-for="tag in siteTags(site)"
              :key="tag"
              class="rounded-full border border-foreground/10 px-3 py-1 font-mono text-xs text-muted-foreground"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Same bottom line as the hub cards; links point at the hub -->
          <div class="mt-auto flex flex-wrap gap-2 border-t border-foreground/10 pt-5">
            <a
              :href="`${PROJECTS_BASE}/${site.slug}`"
              class="group inline-flex w-fit items-center gap-1.5 font-mono text-[13px] text-primary underline underline-offset-4 transition-colors hover:text-foreground"
            >
              <ArrowUpRight
                class="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
              {{ t('hub.seeDetail') }}
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
