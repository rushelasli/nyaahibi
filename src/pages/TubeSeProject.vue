<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectHero from '@/components/project/ProjectHero.vue'
import ProjectAbout from '@/components/project/ProjectAbout.vue'
import ProjectTextSection from '@/components/project/ProjectTextSection.vue'
import BlockDiagramSection from '@/components/project/BlockDiagramSection.vue'
import Project3DSection from '@/components/project/Project3DSection.vue'
import ProjectReferences from '@/components/project/ProjectReferences.vue'

interface BlockItem {
  title: string
  desc: string
}

/** Set by the projects hub (no router); when omitted, falls back to a router link. */
defineProps<{ backHref?: string }>()

const { tm } = useI18n()

const ampBlocks = computed(() => tm('tubese.ampBlocks') as unknown as BlockItem[])
const psuBlocks = computed(() => tm('tubese.psuBlocks') as unknown as BlockItem[])

const infoParagraphs = ['tubese.infoP1', 'tubese.infoP2', 'tubese.infoP3']

const modelFiles = ['/projects/tubeseamp/tubese.glb']
</script>

<template>
  <main>
    <ProjectHero ns="tubese" :back-href="backHref" />
    <ProjectAbout ns="tubese" />

    <ProjectTextSection
      eyebrow-key="tubese.infoEyebrow"
      title-key="tubese.infoTitle"
      :paragraph-keys="infoParagraphs"
    />

    <BlockDiagramSection
      eyebrow-key="tubese.topologyEyebrow"
      title-key="tubese.topologyTitle"
      image="/projects/tubeseamp/amp.png"
      alt-key="tubese.topologyAlt"
      :blocks="ampBlocks"
    />

    <BlockDiagramSection
      eyebrow-key="tubese.psuEyebrow"
      title-key="tubese.psuTitle"
      image="/projects/tubeseamp/supply.png"
      alt-key="tubese.psuAlt"
      :blocks="psuBlocks"
    />

    <Project3DSection ns="tubese" :files="modelFiles" />
    <ProjectReferences ns="tubese" />
  </main>
</template>
