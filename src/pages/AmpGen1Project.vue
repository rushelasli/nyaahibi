<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectHero from '@/components/project/ProjectHero.vue'
import ProjectAbout from '@/components/project/ProjectAbout.vue'
import BlockDiagramSection from '@/components/project/BlockDiagramSection.vue'
import ProjectReferences from '@/components/project/ProjectReferences.vue'

interface BlockItem {
  title: string
  desc: string
}

/** Set by the projects hub (no router); when omitted, falls back to a router link. */
defineProps<{ backHref?: string }>()

const { tm } = useI18n()

const ampBlocks = computed(() => tm('ampgen1.ampBlocks') as unknown as BlockItem[])
const psuBlocks = computed(() => tm('ampgen1.psuBlocks') as unknown as BlockItem[])
</script>

<template>
  <main>
    <ProjectHero ns="ampgen1" :back-href="backHref" />
    <ProjectAbout ns="ampgen1" />

    <BlockDiagramSection
      eyebrow-key="ampgen1.topologyEyebrow"
      title-key="ampgen1.topologyTitle"
      image="/projects/nyaahibiamp/block_amp.png"
      alt-key="ampgen1.topologyAlt"
      :blocks="ampBlocks"
    />

    <BlockDiagramSection
      eyebrow-key="ampgen1.psuEyebrow"
      title-key="ampgen1.psuTitle"
      image="/projects/nyaahibiamp/block_power.png"
      alt-key="ampgen1.psuAlt"
      :blocks="psuBlocks"
    />

    <ProjectReferences ns="ampgen1" />
  </main>
</template>
