<template>
  <NuxtLayout>
    <UApp>
      <NuxtPage />
    </UApp>
  </NuxtLayout>
</template>

<script setup lang="ts">
const title = 'YapSpace';
const description = 'A simple, but fun chat app for you and your friends!';

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogLocale: 'en_US',
});

const preferredPrimary = useCookie('uiPrimary');
if (preferredPrimary.value) {
    updateAppConfig({ ui: { colors: { primary: preferredPrimary.value } } });
} else {
    preferredPrimary.value = useAppConfig().ui.colors.primary;
}
</script>

<style>
  html {
    scroll-behavior: smooth; /* Smoothly move to the navigation point instead of jumping instantly */
  }
</style>