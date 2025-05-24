<template>
  <NuxtLayout name="gradient-background">
    <AuthFlowInfoCard operation-title="Email Confirmation" class="mx-auto">
      <ClientOnly>
        <div :class="`flex flex-col items-center text-center ${session ? 'text-success' : 'text-error'}`">
          <UIcon :name="session ? 'i-lucide-mail-check' : 'i-lucide-mail-x'" size="x-large" />
          <div class="mt-1">
            {{ session ? successDescription : errorDescription }}
          </div>
        </div>

        <ULink v-if="!session" to="/" class="flex items-center mt-4" color="primary">
          <UIcon name="i-lucide-arrow-left" class="mr-1"/>
          <div>Return to Homepage</div>
        </ULink>
      </ClientOnly>
    </AuthFlowInfoCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
const session = useSupabaseSession();
const route = useRoute();
const timer = ref(3);
const successDescription = computed(() => `Your email address has been confirmed! Redirecting in ${timer.value}`);
const errorDescription = computed(() => route.query.error_description ?? 'Email confirmation failed. Please try again.');

// It's the final countdown!
async function countdown() {
  await new Promise(r => setTimeout(r, 1000));
  timer.value--;
  if (timer.value <= 0) {
    navigateTo('/chat');
    return;
  }
  countdown();
}
onMounted(async () => {
  if (session.value) {
    countdown(); // Initiate the countdown
  }
});
</script>