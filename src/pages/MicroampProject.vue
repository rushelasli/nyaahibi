<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectHero from '@/components/project/ProjectHero.vue'
import ProjectAbout from '@/components/project/ProjectAbout.vue'
import ProjectTextSection from '@/components/project/ProjectTextSection.vue'
import BlockDiagramSection from '@/components/project/BlockDiagramSection.vue'
import ProjectReferences from '@/components/project/ProjectReferences.vue'

interface BlockItem {
  title: string
  desc: string
}

/** Set by the projects hub (no router); when omitted, falls back to a router link. */
defineProps<{ backHref?: string }>()

const { tm } = useI18n()

const microAmpBlocks = computed(() => tm('microamp.ampBlocks') as unknown as BlockItem[])
const microPsuBlocks = computed(() => tm('microamp.psuBlocks') as unknown as BlockItem[])

const infoParagraphs = [
  'microamp.infoP1',
  'microamp.infoP2',
  'microamp.infoP3',
  'microamp.infoP4',
]
</script>

<template>
  <main>
    <ProjectHero ns="microamp" :back-href="backHref" />
    <ProjectAbout ns="microamp" />

    <ProjectTextSection
      eyebrow-key="microamp.infoEyebrow"
      title-key="microamp.infoTitle"
      :paragraph-keys="infoParagraphs"
    />

    <BlockDiagramSection
      eyebrow-key="microamp.topologyEyebrow"
      title-key="microamp.topologyTitle"
      :blocks="microAmpBlocks"
    />

    <BlockDiagramSection
      eyebrow-key="microamp.psuEyebrow"
      title-key="microamp.psuTitle"
      :blocks="microPsuBlocks"
    />

    <ProjectReferences ns="microamp" />
  </main>
</template>
