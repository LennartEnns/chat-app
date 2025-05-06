<template>
  <NuxtLayout>
    <UApp>
      <NuxtPage />
    </UApp>
  </NuxtLayout>
</template>

<script setup>
  const title = 'YapSpace';
  const description = 'A simple, but fun chat app for you and your friends!';

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogLocale: 'en_US',
  });
</script>

<style>
  html {
    scroll-behavior: smooth; /* Smoothly move to the navigation point instead of jumping instantly */
  }
</style>