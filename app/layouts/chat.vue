<template>
  <NuxtLayout
    name="logged-in"
    :class="`${isLight ? 'base' : 'base-dark'} max-h-dvh`"
  >
    <div class="main-layout grow">
      <!--Mobile UI drawer for choosing chats-->
      <UDrawer v-if="isMobile" v-model:open="drawerOpen" direction="bottom">
        <template #body>
          <div class="align-column">
            <ModalSearchUser @close="onUserSelect">
              <UButton
                label="Search Users"
                color="neutral"
                variant="subtle"
                icon="i-lucide-search"
                class="glassContainer"
              />
            </ModalSearchUser>
            <UButton
              class="mb-[10px]"
              label="Neuen Chat erstellen"
              color="primary"
              variant="solid"
              icon="i-lucide-plus"
              @click="newChatModalOpen = true"
            />
          </div>
        </template>
      </UDrawer>
      <!--Desktop column for choosing chats-->
      <div v-if="!isMobile" class="align-column">
        <ModalSearchUser @close="onUserSelect">
          <UButton
            label="Search Users"
            color="neutral"
            variant="subtle"
            icon="i-lucide-search"
          />
        </ModalSearchUser>
        <UButton
          class="mb-[10px]"
          label="Neuen Chat erstellen"
          color="primary"
          variant="solid"
          icon="i-lucide-plus"
          @click="newChatModalOpen = true"
        />
      </div>
      <slot />
    </div>
    <UModal v-model:open="newChatModalOpen">
      <template #content>
        <NewChat
          @create="handleCreateChat"
          @cancel="newChatModalOpen = false"
        />
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";

const newChatModalOpen = ref(false);
const isMobile = useMobileDetector();
const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();

// Handle user selection in the command palette
async function onUserSelect(result: UserSearchResult | null) {
  if (!result) return;
  navigateTo(`/profile/${result.username}`);
}

async function handleCreateChat() {
  console.log("Test");
}
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
