<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Welcome to YapSpace!"
    class="border-1"
  >
    <template #title>
      <div class="text-lg">
        Welcome to YapSpace{{ isFalsy(userData.username) ? '' : `, ${userData.username}` }}!
      </div>
    </template>
    <template #description>
      <div class="text-lg">
        Let's complete your profile first.
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton variant="ghost" color="neutral" label="I'll do it later" @click="emit('close', false)" />
        <UButton variant="ghost" label="Ok, let's go!" @click="emit('close', true)" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>()
const userData = useUserData();
</script>