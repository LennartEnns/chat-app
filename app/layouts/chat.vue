<template>
  <NuxtLayout
    name="logged-in"
    :class="`${isLight ? 'base' : 'base-dark'} max-h-dvh`"
  >
    <div class="main-layout grow">
      <!--Mobile UI drawer for choosing chats-->
      <UDrawer v-if="isMobile" v-model:open="drawerOpen" direction="bottom">
        <template #body>
          <ChatOverviewColumn />
        </template>
      </UDrawer>
      <!--Desktop column for choosing chats-->
      <ChatOverviewColumn v-if="!isMobile" />
      <slot />
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
const isMobile = useMobileDetector();
const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
