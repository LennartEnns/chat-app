<template>
  <NuxtLayout name="logged-in">
    <div class="flex justify-center grow">
      <div class="glassContainer mainContainer max-w-[41rem] px-8">
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
.mainContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding-inline: calc(var(--spacing) * 18) !important;
}
</style>
