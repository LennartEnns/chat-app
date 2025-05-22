<template>
  <div>
    <h1>Email Confirmation</h1>
    <p v-if="status === 'checking'">Checking confirmation...</p>
    <p v-else-if="status === 'success'">Your email has been confirmed! Redirecting...</p>
    <p v-else>Email confirmation failed. Please try again.</p>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

const status = ref<'checking' | 'success' | 'error'>('checking')

onMounted(async () => {
  if (user.value) {
    status.value = 'success'
    navigateTo('/chat');
  } else {
    status.value = 'error'
  }
})
</script>