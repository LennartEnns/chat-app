<template>
  <NuxtLayout name="logged-in">
    <div class="flex justify-center pageWrap grow">
      <div class="mainContainer">
        <UNavigationMenu :items="navMenuItems" class="w-full justify-center" />
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const navMenuItems = ref<NavigationMenuItem[]>([
  {
    label: "Account",
    icon: "i-lucide-user",
    to: "/settings/account",
  },
  {
    label: "Appearance",
    icon: "i-lucide-wand-sparkles",
    to: "/settings/appearance",
  },
]);
</script>

<style scoped>
.pageWrap {
  padding: 20px;
}

.mainContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Consistent spacing between sections */
  width: 100%;
  max-width: 30rem;
}
</style>