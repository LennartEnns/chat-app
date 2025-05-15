<template>
  <UInput
    v-model="model"
    :type="showPassword ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1' }"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :aria-pressed="showPassword"
        aria-controls="password"
        @click="showPassword = !showPassword"
      />
    </template>
  </UInput>
</template>

<script lang="ts" setup>
const model = defineModel<string | undefined>()
const showPassword = ref(false)
</script>

<style>

</style>