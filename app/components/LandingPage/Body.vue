<template>
  <main class="body-section">
    <div class="main-content">
      <h1 :class="`headline ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">
        <div v-if="!loggedIn">
          The modern<br>Chat App
        </div>
        <div v-else class="space-y-3 font-normal">
          <div v-if="!isFalsy(userData.username)">
            Hello <span class="font-bold">{{ userData.username }}</span>
          </div>
          <div v-if="!isMobile">
            Welcome Back to <span :class="`${themedPrimary} font-bold`">YapSpace!</span>
          </div>
          <div v-else>
            Welcome Back!
          </div>
          <UButton
            variant="ghost"
            class="mt-2 md:mt-4 text-4xl space-x-2"
            @click="navigateTo(chatUrl)"
          >
            <UIcon name="i-lucide-messages-square" />
            <div>Open Chats</div>
            <UIcon name="i-lucide-arrow-right" />
          </UButton>
        </div>
      </h1>
      <p v-if="!loggedIn" :class="`subtext ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">
        Connect to the world! <br> We do not steal your data like the big social media companies.
      </p>
      <UNavigationMenu
        v-if="!loggedIn"
        :items="navigationItems"
        class="justify-center"
        :ui="{
          linkLeadingIcon: navItemColor,
          linkLabel: navItemColor,
        }"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const userData = useUserData();

defineProps<{
  loggedIn: boolean,
}>();

const { isLight } = useSSRSafeTheme();
const isMobile = useMobileDetector();
const themedPrimary = computed(() => isLight.value ? 'text-primary-600' : 'text-primary');

const navigationItems = ref<NavigationMenuItem[]>([
  { label: 'Chat', icon: 'i-lucide-messages-square', to: '/chat' },
  { label: 'GitHub', icon: 'i-simple-icons-github', to: 'https://github.com/LennartEnns/chat-app', target: '_blank' },
  { label: 'Instagram', icon: 'i-simple-icons-instagram', to: 'https://www.youtube.com/watch?v=xvFZjo5PgG0', target: '_blank'}
]);
const navItemColor = computed(() => isLight.value ? 'text-neutral-800' : 'text-neutral-300');

// These will only be used in case the user is logged in
const lastChatroomState = useState<string | undefined>("lastOpenedChatroomId");
const chatUrl = computed(() => lastChatroomState.value ? `/chat/${lastChatroomState.value}` : '/chat');
</script>

<style scoped>
.body-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
  text-align: center;
}

.main-content {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.headline {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.2;
  z-index: 1;
}

.subtext {
  font-size: 1rem;
  opacity: 0.8;
  max-width: 500px;
}
</style>