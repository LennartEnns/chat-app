<template>
  <main class="body-section">
    <div class="main-content">
      <h1 :class="`headline ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">The modern<br>Chat App</h1>
      <p :class="`subtext ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">
        Connect to the world! <br> We do not steal your data like the big social media companies.
      </p>
      <UNavigationMenu
        :items="navigationItems"
        class="justify-center"
        :ui="{
          linkLeadingIcon: navItemColor,
          linkLabel: navItemColor,
        }"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { isLight } = useSSRSafeTheme();

const navigationItems = ref<NavigationMenuItem[]>([
  { label: 'Chat', icon: 'i-lucide-messages-square', to: '/chat' },
  { label: 'GitHub', icon: 'i-simple-icons-github', to: 'https://github.com/LennartEnns/chat-app', target: '_blank' },
]);
const navItemColor = computed(() => isLight.value ? 'text-neutral-800' : 'text-neutral-300');
</script>

<style scoped>
.body-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
  text-align: center;
}

.main-content {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.headline {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.2;
  z-index: 1;
}

.subtext {
  font-size: 1rem;
  opacity: 0.8;
  max-width: 500px;
}
</style>