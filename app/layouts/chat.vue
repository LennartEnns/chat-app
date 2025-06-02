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
      </div>
      <slot />
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";

const isMobile = useMobileDetector();
const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();

// Handle user selection in the command palette
async function onUserSelect(result: UserSearchResult | null) {
  if (!result) return;
  navigateTo(`/profile/${result.username}`);
}
</script>

<style>
@import url("~/assets/css/chat.css");
</style>