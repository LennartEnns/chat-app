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

// SEO config
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogLocale: 'en_US',
});

// Favicons in head
useHead({
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'shortcut icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ],
  meta: [
    { name: 'apple-mobile-web-app-title', content: 'YapSpace' }
  ]
})

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