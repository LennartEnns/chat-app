<template>
  <div class="min-h-dvh h-full flex justify-center">
    <div class="w-full max-w-[120rem] flex flex-col pb-[2vh]">
      <div
        :class="`flex flex-row items-center mx-2 md:mx-4 lg:mx-6  pb-[1vh]
            ${isMobile ? 'justify-between py-1' : ''}`"
      >
        <UButton
          v-if="isMobile"
          :icon="mobileLeftButton.icon"
          color="neutral"
          variant="ghost"
          class="py-1 h-min self-center cursor-pointer"
          size="xl"
          :label="mobileLeftButton.label"
          @click="mobileLeftButton.onClick"
        />
        <UButton
          variant="ghost"
          class="text-xl font-bold p-0 hover:bg-transparent cursor-pointer text-primary"
          @click="navigateTo('/')"
        >
          YapSpace
        </UButton>
        <ThemeSwitch v-if="!isMobile" class="ml-4" />
        <div v-if="!isMobile" class="w-full" />
        <UNavigationMenu
          v-if="!isMobile"
          :items="items"
          class="z-50"
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
          <div class="flex flex-col gap-1 md:flex-row md:gap-0">
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
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
import { getAuthErrorMessage, logAuthError } from "~~/errors/authErrors";

const supabase = useSupabaseClient();
const operationFeedbackHandler = useOperationFeedbackHandler();
const route = useRoute();
const drawerOpen = useOpenDrawer();
const isMobile = useMobileDetector();
const mobileMenuOpen = ref(false);

const mobileLeftButton = computed(() => {
  if (route.name === 'chat-id-info') {
    return {
      icon: 'i-lucide-arrow-left',
      label: 'Back',
      onClick: () => {
        const chatroomId = route.params.id as string | null;
        if (!chatroomId) navigateTo('/chat');
        navigateTo(`/chat/${chatroomId}`);
      },
    };
  }
  const buttonData = {
    icon: 'i-lucide-messages-square',
    label: 'Chats',
  };
  if (route.name === 'chat' || route.name === 'chat-id') {
    // These routes use the mobile drawer, so just open it
    return {
      ...buttonData,
      onClick: () => drawerOpen.value = true,
    }
  }
  // Default: Navigate to /chat landing page
  return {
    ...buttonData,
    label: 'Chat',
    onClick: () => navigateTo('/chat'),
  }
});

async function logout(scope: "global" | "local" | "others") {
  if (scope !== "others") {
    navigateTo("/");
  }
  const { error } = await supabase.auth.signOut({
    scope,
  });
  if (error) {
    logAuthError(error, "logout");
    operationFeedbackHandler.displayError(
      getAuthErrorMessage(error, "Unexpected error during logout")
    );
  } else if (scope === "others") {
    operationFeedbackHandler.displaySuccess(
      "All other sessions have been terminated."
    );
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
    label: "Overview",
    icon: "i-lucide-messages-square",
    to: "/chat",
  },
  {
    label: "Settings",
    icon: "i-lucide-settings",
    to: "/settings/account",
    children: [
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
    ],
  },
  {
    label: "Account",
    icon: "i-lucide-user",
    to: "/profile",
    children: [
      {
        label: "Profile",
        icon: "i-lucide-circle-user-round",
        to: `/profile`,
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
