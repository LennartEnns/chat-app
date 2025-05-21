<template>
  <div class="min-h-dvh h-dvh max-h-dvh flex flex-col">
    <div
      :class="`flex flex-row align-content-center mx-2 md:mx-4 lg:mx-6
            ${
              isMobile
                ? 'justify-between py-1 border-b-1 border-neutral-500'
                : ''
            }`"
    >
      <UButton
        v-if="isMobile"
        :icon="buttonIcon"
        color="neutral"
        variant="ghost"
        class="py-1 h-min self-center cursor-pointer"
        size="xl"
        :label="buttonText"
        @click="buttonTarget"
      />
      <UButton
        variant="ghost"
        :class="`text-xl font-bold p-0 hover:bg-transparent cursor-pointer ${themedLogoColor}`"
        @click="navigateTo('/')"
      >
        YapSpace
      </UButton>
      <ThemeSwitch v-if="!isMobile" class="ml-4" />
      <div v-if="!isMobile" class="w-full" />
      <UNavigationMenu
        v-if="!isMobile"
        :items="items"
        class="w-min justify-self-center"
      />
      <UDrawer
        v-else
        v-model:open="mobileMenuOpen"
        direction="top"
        :ui="{
          header: 'flex flex-row justify-end',
          container: 'gap-0',
        }"
      >
        <UButton
          trailing-icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          size="xl"
          >Menu</UButton
        >
        <template #header>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="mobileMenuOpen = false"
          />
        </template>
        <template #body>
          <UNavigationMenu
            :items="items"
            orientation="vertical"
            :ui="{
              linkLeadingIcon: 'size-6',
              linkLabel: 'text-lg',
            }"
          />
        </template>
      </UDrawer>
    </div>
    <UModal
      v-model:open="showLogoutModal"
      title="Terminate Sessions"
      description="Choose which sessions to terminate."
    >
      <template #body>
        <div class="flex flex-col md:flex-row">
          <UButton
            variant="ghost"
            icon="i-lucide-log-out"
            @click="logout('local')"
          >
            This session only
          </UButton>
          <UButton
            variant="ghost"
            icon="i-lucide-log-out"
            @click="logout('global')"
          >
            All sessions
          </UButton>
          <UButton
            variant="ghost"
            icon="i-lucide-log-out"
            @click="logout('others')"
          >
            Other sessions only
          </UButton>
        </div>
      </template>
    </UModal>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const isLight = useSSRSafeTheme();
const themedLogoColor = computed(() => "text-primary");

const isMobile = useMobileDetector();
const mobileMenuOpen = ref(false);

const supabase = useSupabaseClient();
const toast = useToast();

const drawerOpen = useOpenDrawer();
const buttonText = ref<string>("Back");
const buttonIcon = ref<string>("i-lucide-arrow-left");

async function buttonTarget() {
  if (route.path === "/chat") {
    drawerOpen.value = true;
  } else {
    navigateTo("/chat");
  }
}

if (route.path === "/chat") {
  buttonText.value = "Chats";
  buttonIcon.value = "i-lucide-messages-square";
}

async function logout(scope: "global" | "local" | "others") {
  const { error } = await supabase.auth.signOut({
    scope,
  });
  if (error) {
    console.log(`Logout error: ${error}`);
    toast.add({
      title: "Error",
      description: "An unexpected error occured during logout.",
      color: "error",
    });
  } else if (scope !== "others") {
    navigateTo("/");
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
    label: "Chat",
    icon: "i-lucide-messages-square",
    to: "/chat",
  },
  {
    label: "Settings",
    icon: "i-lucide-settings",
    to: "/settings/account",
  },
  {
    label: "Account",
    icon: "i-lucide-user",
    children: [
      {
        label: "Profile",
        icon: "i-lucide-circle-user-round",
        to: "/profile",
      },
      {
        label: "Logout",
        icon: "i-lucide-log-out",
        onSelect: onLogoutSelect,
      },
    ],
  },
]);
</script>

<style></style>
