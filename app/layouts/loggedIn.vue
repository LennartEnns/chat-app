<template>
  <div class="min-h-screen flex flex-col">
    <div 
      :class="`flex flex-row align-content-center mx-2 md:mx-4 lg:mx-6
          ${isMobile ? 'justify-between border-1 rounded-2xl mt-2' : ''}`"
    >
      <UButton
        v-if="isMobile" icon="i-lucide-arrow-left" color="neutral" variant="ghost"
        class="py-1 h-min self-center cursor-pointer" size="xl" @click="navigateTo('/chat')">Back</UButton>
      <div class="my-auto text-xl text-primary-300">
        YapSpace
      </div>
      <ClientOnly>
        <USwitch
          v-if="!isMobile"
          v-model="isLight"
          class="self-center ml-4"
          unchecked-icon="i-lucide-moon"
          checked-icon="i-lucide-sun"
        />
      </ClientOnly>
      <div v-if="!isMobile" class="w-full" />
      <UNavigationMenu v-if="!isMobile" :items="items" class="w-min justify-self-center" />
      <UDrawer
        v-else v-model:open="mobileMenuOpen" direction="top"
        :ui="{
          header: 'flex flex-row justify-end',
          container: 'gap-0',
        }">
        <UButton icon="i-lucide-menu" color="neutral" variant="ghost" size="xl">Menu</UButton>
        <template #header>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="mobileMenuOpen = false" />
        </template>
        <template #body>
          <UNavigationMenu :items="items" orientation="vertical" />
        </template>
      </UDrawer>
    </div>
    <UModal v-model:open="showLogoutModal" title="Terminate Sessions" description="Choose which sessions to terminate.">
      <template #body>
        <div class="flex flex-col md:flex-row">
          <UButton variant="ghost" icon="i-lucide-log-out" @click="logout('local')">
            This session only
          </UButton>
          <UButton variant="ghost" icon="i-lucide-log-out" @click="logout('global')">
            All sessions
          </UButton>
          <UButton variant="ghost" icon="i-lucide-log-out" @click="logout('others')">
            Other sessions only
          </UButton>
        </div>
      </template>
    </UModal>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const isLight = useSSRSafeTheme()

const isMobile = useUseMobileDetector()
const mobileMenuOpen = ref(false)

const supabase = useSupabaseClient();
const toast = useToast();

async function logout(scope: "global" | "local" | "others") {
  const { error } = await supabase.auth.signOut({
    scope
  });
  if (error) {
    console.log(`Logout error: ${error}`);
    toast.add({
      title: "Error",
      description: "An unexpected error occured during logout.",
      color: "error",
    });
  } else if (scope !== 'others') {
    navigateTo('/');
  } else {
    toast.add({
      title: "Success",
      description: "All other sessions have been terminated.",
      color: "success",
    });
    showLogoutModal.value = false;
  }
}

async function onLogoutSelect() {
  mobileMenuOpen.value = false;
  showLogoutModal.value = true;
}

const showLogoutModal = ref(false);
const items = ref<NavigationMenuItem[]>([
  {
    label: 'Chat',
    icon: 'i-lucide-messages-square',
    to: '/chat',
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/settings',
  },
  {
    label: 'Account',
    icon: 'i-lucide-user',
    children: [
      {
        label: 'Profile',
        icon: 'i-lucide-circle-user-round',
        to: '/profile',
      },
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        onSelect: onLogoutSelect,
      },
    ]
  },
]);
</script>

<style>

</style>