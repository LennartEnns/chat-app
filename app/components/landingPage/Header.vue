<!-- <template>
  <header class="header-wrapper">
    <div class="header-buttons">
      <UButton label="Register" color="neutral" variant="ghost" @click="goToRegister" />
      <UButton label="Login" color="primary" variant="ghost" @click="goToLogin" />
    </div>

    <div class="header-center">
      <UNavigationMenu :items="items" class="w-full justify-center" arrow content-orientation="vertical" color="neutral" v-model="active"/>
    </div>

    <div class="header-logo">
      <h1 class="text-xl font-bold">Yapspace</h1>
    </div>
  </header>
</template> -->

<template>
  <header class="w-full px-8 pt-1 bg-transparent relative z-20">
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">

      <div :class="`flex-shrink-0 text-xl font-bold ${logoColor}`">
        YapSpace
      </div>

      <div class="w-full md:w-auto">
        <UNavigationMenu
          :items="navigationItems"
          class="justify-center"
          color="neutral"
        />
      </div>

      <div class="flex gap-2 flex-shrink-0">
        <UButton :class="`${registerButtonColor}`" label="Register" color="neutral" variant="ghost" @click="navigateTo('/register')" />
        <UButton :class="`${loginButtonColor}`" label="Login" color="primary" variant="ghost" @click="navigateTo('/login')" />
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const navigationItems = ref<NavigationMenuItem[]>([
  { label: 'Chat', icon: 'i-lucide-messages-square', to: '/chat' },
  { label: 'GitHub', icon: 'i-simple-icons-github', to: 'https://github.com/LennartEnns/chat-app', target: '_blank' },
]);

const isLight = useSSRSafeTheme();
const registerButtonColor = computed(() => isLight.value ? 'text-neutral-800' : 'text-neutral-100');
const loginButtonColor = computed(() => isLight.value ? 'text-primary-600' : 'text-primary-600');
const logoColor = computed(() => isLight.value ? 'text-neutral-800' : 'text-neutral-100');
</script>

<style scoped>
.header-wrapper {
  position: relative;
  color: white;
  padding: 1rem 1.5rem;
  min-height: 80px;
}
.header-buttons {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}
.header-logo {
  position: absolute;
  top: 1rem;
  left: 1.5rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}
.header-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

button {
  cursor: pointer;
}
</style>