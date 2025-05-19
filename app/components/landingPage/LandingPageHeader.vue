<template>
  <header class="w-full px-6 lg:px-8 bg-transparent relative pt-3">
    <div class="flex flex-row items-center justify-between">

      <UButton
        variant="ghost"
        :class="`flex-shrink-0 text-xl font-bold p-0 hover:bg-transparent cursor-pointer ${logoColor}`"
        @click="navigateTo('/')">
        <img 
        :src=logoColor
        alt="YapSpace" 
        class="h-13 w-auto object-contain" />
      </UButton>

      <ThemeSwitch class="ml-4" />

      <div class="w-full" />

      <div class="flex gap-2 flex-shrink-0">
        <UButton :class="`${registerButtonColor}`" label="Register" color="neutral" variant="ghost" size="xl" @click="navigateTo('/register')" />
        <UButton :class="`${loginButtonColor}`" label="Login" color="primary" variant="ghost" size="xl" @click="navigateTo('/login')" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import logo_lightened from '@/assets/images/logo.png'
import logo_darkened from '@/assets/images/logo_darkened.png'

const isLight = useSSRSafeTheme();

const registerButtonColor = computed(() => isLight.value ? 'text-neutral-800' : 'text-neutral-100');
const loginButtonColor = computed(() => isLight.value ? 'text-primary-600' : 'text-primary-600');
//const logoColor = computed(() => isLight.value ? 'text-neutral-800' : 'text-neutral-100');
const logoColor = computed(() => isLight.value ? logo_darkened : logo_lightened);
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