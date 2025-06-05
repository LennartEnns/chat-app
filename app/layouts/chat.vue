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
        <ModalSearchUser class="mb-3" @close="onUserSelect">
          <UButton
            label="Search Users"
            color="neutral"
            variant="subtle"
            icon="i-lucide-search"
          />
        </ModalSearchUser>

        <UButton
          v-for="(user, i) in availableChatrooms.data"
          class="mb-1"
          :label="user.name"
          variant="subtle"
        />
      </div>
      <slot />
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { UserSearchResult } from "~/types/userSearch";
import { userLimits } from "~~/validation/commonLimits";

const isMobile = useMobileDetector();
const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();

// Handle user selection in the command palette
async function onUserSelect(result: UserSearchResult | null) {
  if (!result) return;
  navigateTo(`/profile/${result.username}`);
}

const supabase = useSupabaseClient();
let availableChatrooms: Object = await supabase.from("chatrooms").select("*");
availableChatrooms.data?.forEach((element: Object, i: Number) => {
  console.log(element);
  console.log(i);
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
