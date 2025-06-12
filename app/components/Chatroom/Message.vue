<template>
  <div
    class="message user light:user-light dark:user-dark whitespace-pre-line wrap-anywhere"
    @contextmenu.prevent="handleContextMenu($event, message)"
  >
    <UAvatar class="justify-self-center" :src="undefined" />
    <div class="message-content">
      <p>{{ message.content }}</p>
      <span class="message-time">{{ dateToHMTime(message.created_at) }}</span>
      <UDropdownMenu
        :items="dropdownItems"
        :ui="{
          content: 'w-48',
        }"
      >
        <UButton
          icon="i-heroicons-ellipsis-horizontal"
          variant="ghost"
          class="message-options-button"
        />
      </UDropdownMenu>
    </div>
  </div>
  <UContextMenu
    ref="contextMenuRef"
    v-model:show="isContextMenuOpen"
    :items="contextMenuItems"
  />
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";
import type { Message } from "~/types/messages/messageLoading";

defineProps<{
  message: Message,
}>();

const dropdownItems = ref<DropdownMenuItem[]>([
  {
    label: "Löschen",
    icon: "i-lucide-trash",
    click: () => {
      console.log("Löschen geklickt vom Dropdown!");
      // Implementiere hier die Löschlogik
    },
  },
  {
    label: "Bearbeiten",
    icon: "i-lucide-edit",
    click: () => {
      console.log("Bearbeiten geklickt vom Dropdown!");
      // Implementiere hier die Bearbeitungslogik
    },
  },
]);

interface UContextMenuInstance {
  open: (event: MouseEvent) => void;
}

const contextMenuRef = ref<UContextMenuInstance | null>(null);
const isContextMenuOpen = ref(false);
const activeMessage = ref<Message | null>(null);
const handleContextMenu = (
  event: MouseEvent | TouchEvent,
  message: Message,
) => {
  activeMessage.value = message;
  console.log("Kontextmenü ausgelöst (contextmenu event)", event);
  if (contextMenuRef.value) {
    contextMenuRef.value.open(event as MouseEvent);
    isContextMenuOpen.value = true;
    console.log("Kontextmenü-Öffnungsversuch über contextmenu event.");
  } else {
    console.log(
      "contextMenuRef.value ist null, kann Kontextmenü nicht öffnen."
    );
  }
};

const contextMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Löschen",
      icon: "i-lucide-trash",
      click: () => {
        if (activeMessage.value) {
          console.log(
            "Nachricht löschen (Kontextmenü):",
            activeMessage.value.content
          );
          // Implementiere hier die Löschlogik
        }
        isContextMenuOpen.value = false;
      },
    },
    {
      label: "Bearbeiten",
      icon: "i-lucide-edit",
      click: () => {
        if (activeMessage.value) {
          console.log(
            "Nachricht bearbeiten (Kontextmenü):",
            activeMessage.value.content
          );
        }
        isContextMenuOpen.value = false;
      },
    },
  ],
]);
</script>

<style>
@import url("~/assets/css/chat.css");
</style>