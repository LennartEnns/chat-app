<template>
  <NuxtLayout name="gradient-background">
    <AuthFlowInfoCard operation-title="Email Change" class="m-auto">
      <div :class="`flex flex-col items-center text-center ${textColorClass}`">
        <UIcon :name="mailIcon" size="x-large" />
        <div class="mt-1">
          {{ status !== 'error' ? successDescription : errorDescription }}
        </div>
      </div>

      <ULink to="/settings/account" class="flex items-center mt-4" color="primary">
        <UIcon name="i-lucide-arrow-left" class="mr-1"/>
        <div>Return to Account Settings</div>
      </ULink>
    </AuthFlowInfoCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute();
const status = computed(() => {
  if (route.query.code && !route.query.error) {
    return 'complete';
  } else if (route.query.message && !route.query.error) {
    return 'partial';
  } else {
    return 'error';
  }
});
const textColorClass = computed(() => (status.value !== 'error') ?
                                      (status.value === 'complete' ? 'text-success' : 'text-warning')
                                          : 'text-error');
const mailIcon = computed(() => status.value === 'complete' ? 'i-lucide-mail-check' :
                               (status.value === 'partial' ? 'i-lucide-mail-warning' : 'i-lucide-mail-x'));
const successDescription = computed(() => route.query.message ?? 'Your email address has been successfully changed!');
const errorDescription = computed(() => route.query.error_description ?? 'Email change failed. Please try again.');
</script>