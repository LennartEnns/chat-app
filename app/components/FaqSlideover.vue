<template>
  <USlideover v-model:open="modal.faqOpen" title="FAQ">
    <template #body>
      <UAccordion :items="items" type="single">
        <template #content="{ item }">
          <p class="pb-3.5 text-sm text-primary">
            {{ item.content }}
          </p>
        </template>
      </UAccordion>
    </template>
  </USlideover>
</template>

<script setup lang="ts">

import { useModalStore } from '~/stores/useModalStore'
import type { AccordionItem } from '@nuxt/ui'

const modal = useModalStore()

const items: AccordionItem[] = [
  {
    label: `Why the name 'YapSpace'?`,
    content: `We chose YapSpace as the name of our Application, because we like to yap.`,
  },
  {
    label: 'What is YapSpace?',
    content: `YapSpace is a chat Application.`
  },
  {
    label: 'What makes YapSpace so special?',
    content: `YapSpace uses modern UI elements to enhance the user experience.`
  }
]
</script>

<style>

</style>