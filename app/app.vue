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

// Disable the user from scrolling "past" the page for a moment
onMounted(() => {
  const handleWheel = (event: WheelEvent) => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    // interfere when user is at top
    if (scrollTop === 0 && event.deltaY < 0) {
      event.preventDefault();
      return;
    }

    // interfere when user is at bottom
    if (scrollTop + windowHeight === documentHeight && event.deltaY > 0) {
      event.preventDefault();
      return;
    }
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
  onUnmounted(() => {
    window.removeEventListener("wheel", handleWheel);
  });
});
</script>

<style>
  html {
    scroll-behavior: smooth; /* Smoothly move to the navigation point instead of jumping instantly */
  }
</style>