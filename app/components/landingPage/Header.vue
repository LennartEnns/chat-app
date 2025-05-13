<template>
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
</template>

<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  // navigation-menu

  const items = ref<NavigationMenuItem[]>([
  {
    label: 'About',
    icon: 'i-lucide-book-open',
    to: '/getting-started',
    
    children: [
    ]
  },
  {
    label: 'Composables',
    icon: 'i-lucide-database',
    to: '/composables',
    children: [
      {
        label: 'defineShortcuts',
        icon: 'i-lucide-file-text',
        description: 'Define shortcuts for your application.',
        to: '/composables/define-shortcuts'
      }
    ]
  },
  {
    label: 'Components',
    icon: 'i-lucide-box',
    to: '/components',
    children: [
      {
        label: 'Link',
        icon: 'i-lucide-file-text',
        description: 'Use NuxtLink with superpowers.',
        to: '/components/link'
      }
    ]
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    badge: '5',
    to: 'https://github.com/nuxt/ui',
    target: '_blank'
  },
  {
    label: 'Help',
    icon: 'i-lucide-circle-help',
    disabled: true
  }
  ])

  // active item control

  const active = ref()

  defineShortcuts({
    1: () => {
      active.value = '0'
    },
    2: () => {
      active.value = '1'
    },
    3: () => {
      active.value = '2'
    }
  })

  // routing
  const router = useRouter();

  const goToLogin = () => {
    router.push('/login')
  };
  const goToRegister = () => {
    router.push('/register')
  };
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
</style>