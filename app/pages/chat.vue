<template>
  <NuxtLayout name="logged-in">
    <div class="main-layout grow">
      <!--Mobile UI drawer for choosing chats-->
      <UDrawer v-model:open="drawerOpen" direction="bottom" v-if="isMobile">
        <template #body>
          <div class="align-column">
            <UModal v-model:open="open" class="mb-[10px]">
              <UButton
                label="Search users..."
                color="neutral"
                variant="subtle"
                icon="i-lucide-search"
              />
              <template>
                <UAvatar src="https://github.com/benjamincanac.png" />
              </template>
              <template #content>
                <UCommandPalette
                  close
                  :groups="groups"
                  @update:open="open = $event"
                />
              </template>
            </UModal>
            <UButton
              class="mb-[10px]"
              label="Neuen Chat erstellen"
              color="primary"
              variant="solid"
              icon="i-lucide-plus"
              @click="openNewChatModal"
            />
            <UButton
              class="chat"
              :avatar="{
                src: 'https://github.com/nuxt.png',
              }"
              color="primary"
              variant="outline"
              size="xl"
              >Florian Steckchen</UButton
            >
            <UButton
              class="chat"
              :avatar="{
                src: 'https://github.com/nuxt.png',
              }"
              color="primary"
              variant="outline"
              size="xl"
              >Johannes Weigel</UButton
            >
          </div>
        </template>
      </UDrawer>

      <!--Desktop column for choosing chats-->
      <div v-if="!isMobile" class="align-column">
        <UModal v-model:open="open" class="mb-[10px]">
          <UButton
            label="Search users..."
            color="neutral"
            variant="subtle"
            icon="i-lucide-search"
          />
          <template #content>
            <UCommandPalette
              close
              :groups="groups"
              @update:open="open = $event"
            />
          </template>
        </UModal>

        <UButton
          class="mb-[10px]"
          label="Neuen Chat erstellen"
          color="primary"
          variant="solid"
          icon="i-lucide-plus"
          @click="openNewChatModal"
        />
        <UButton
          class="chat"
          :avatar="{
            src: 'https://github.com/nuxt.png',
          }"
          color="primary"
          variant="outline"
          size="xl"
          >Florian Steckchen</UButton
        >
        <UButton
          class="chat"
          :avatar="{
            src: 'https://github.com/nuxt.png',
          }"
          color="primary"
          variant="outline"
          size="xl"
          >Johannes Weigel</UButton
        >
      </div>

      <!--Messaging column-->
      <div class="align-column">
        <UCard class="profile-bar">
          <div class="flex items-center gap-2">
            <UAvatar src="https://github.com/nuxt.png" />
            <h1>Florian Steckchen</h1>
          </div>
        </UCard>
        <div class="messages" ref="messagesContainer">
          <!--example messages-->
          <div :class="`message partner ${themedPartnerMessageColor}`">
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div class="message-content">
              <p>
                Ipsum is simply dummy an printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not
                only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was popularised
                in the 1960s with the release of Letraset sheets containing
                Lorem Ipsum passages, and more recently wit fkjsdaklfjklasd
                jfkjsadkl jfkljsadklfj föajsklfjkladsjfkl
              </p>
              <span class="message-time">12:45</span>
            </div>
          </div>
          <div :class="`message user ${themedUserMessageColor}`">
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div class="message-content">
              <p>
                Ipsum is simply dummy an printer took a galley of type and
                scrambled it to make a type specimen book. It has survived not
                only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was popularised
                in the 1960s with the release of Letraset sheets containing
                Lorem Ipsum passages, and more recently wit fkjsdaklfjklasd
                jfkjsadkl jfkljsadklfj föajsklfjkladsjfkl
              </p>
              <span class="message-time">12:48</span>
            </div>
          </div>
          <div
            v-for="(message, index) in userMessages"
            :key="index"
            :class="`message user ${themedUserMessageColor}`"
          >
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div class="message-content">
              <p>{{ message.text }}</p>
              <span class="message-time">{{ message.timestamp }}</span>
            </div>
          </div>
        </div>
        <!--Text Input for new messages-->
        <div class="write">
          <UTextarea
            v-model="newMessage"
            class="w-full"
            placeholder="Write a message..."
            autoresize
            :rows="4"
            :maxrows="4"
          />
          <UButton @click="sendMessage" :class="`${themedUserMessageColor}`"
            ><Icon name="ic:baseline-send"
          /></UButton>
        </div>
      </div>
    </div>

    <UModal v-model:open="newChatModalOpen">
      <template #content>
        <NewChat @create="handleCreateChat" @cancel="closeNewChatModal" />
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import NewChat from "~/components/Form/NewChatForm.vue";

const newChatModalOpen = ref(false);

function openNewChatModal() {
  drawerOpen.value = false;
  newChatModalOpen.value = true;
}

function closeNewChatModal() {
  newChatModalOpen.value = false;
}

function handleCreateChat(data: {
  type: string;
  name: string;
  description?: string;
}) {
  console.log("Neuer Chat erstellt:", data);

  closeNewChatModal();

  toast.add({
    title: "Chat erstellt",
    description: `${data.type === "group" ? "Gruppe" : "Chat"} "${
      data.name
    }" wurde erstellt.`,
    color: "primary",
  });
}

const toast = useToast();
const supabase = useSupabaseClient();

const user = useSupabaseUser();
const profileData = user.value?.user_metadata;
const username = profileData?.username || "";

function getAvatarUrl(userId: string): string {
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl("public/" + userId + ".jpg");
  if (
    !data.publicUrl ||
    data.publicUrl.includes("error") ||
    data.publicUrl === ""
  ) {
    return "https://eunokvzfqixyoauwvqlt.supabase.co/storage/v1/object/public/avatars/public/default.png";
  }
  return data.publicUrl;
}

interface Users {
  user_id: string;
  username: string;
  displayname: string;
  description: string;
}

interface CommandItem {
  id: string;
  label: string;
  suffix: string;
  to: string;
  target: string;
  avatar: { src: string };
  raw: Users;
}

interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

const users = ref<CommandItem[]>([]);

const groups = ref<CommandGroup[]>([
  {
    id: "users",
    label: "Users",
    items: [],
  },
]);

// --- fetch the data from supabase and transform it ---
onMounted(async () => {
  const { data, error } = await supabase.from("profiles").select();

  if (error) {
    toast.add({
      title: "Error loading users",
      description: error.message,
      color: "error",
    });
    return;
  }

  users.value = (data || [])
    .filter((user: Users) => {
      return (
        user &&
        user.user_id &&
        user.user_id.trim() !== "" &&
        user.username !== username &&
        user.displayname &&
        user.displayname.trim() !== ""
      );
    })
    .map((user: Users) => ({
      id: user.user_id,
      label: user.displayname,
      suffix: user.username,
      to: `/profile/${user.user_id}`,
      target: "_self",
      avatar: { src: getAvatarUrl(user.user_id) },
      raw: user,
    }));

  groups.value = [
    {
      id: "users",
      label: "Users",
      items: users.value,
    },
  ];
});

const isMobile = useMobileDetector();
useFirstLoginDetector();

const open = ref<boolean>(false); //placeholder for command pallette (search bar)
const newMessage = ref<string>("");
const userMessages = ref<any[]>([]);
const messagesContainer = ref<any>(null);

const drawerOpen = useOpenDrawer();
const { isLight } = useSSRSafeTheme();

const themedUserMessageColor = computed(() =>
  isLight.value ? "user-light" : "user-dark"
);

const themedPartnerMessageColor = computed(() =>
  isLight.value ? "partner-light" : "partner-dark"
);

function sendMessage(): void {
  if (newMessage.value.trim()) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timestamp = `${hours}:${minutes}`;

    userMessages.value.push({
      text: newMessage.value.trim(),
      timestamp: timestamp,
    });
    newMessage.value = "";
  }
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  const component = messagesContainer.value;
  if (component) {
    component.scrollTop = component.scrollHeight;
  }
};

watch(
  userMessages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  scrollToBottom();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
