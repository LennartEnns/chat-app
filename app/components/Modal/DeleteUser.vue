<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Delete Account"
  >
    <template #title>
      <div class="text-warning flex items-center">
        <UIcon name="i-lucide-triangle-alert" class="mr-2" size="x-large" />
        Delete Account
      </div>
    </template>

    <template #body>
      <div>
        Are you sure? You will not be able to recover any of your data. So better say your final goodbyes!
      </div>
    </template>

    <template #footer>
        <UButton variant="ghost" color="neutral" label="Cancel" @click="emit('close', false)" />
        <UButton variant="ghost" color="error" label="Proceed" @click="emit('close', true)" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ close: [boolean] }>()
</script>

<style>

</style>
