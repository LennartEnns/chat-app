<template>
  <UCard
    variant="subtle"
    class="border-1 border-gray-500"
    :ui="{
      header: 'border-none pb-1 text-lg',
    }"
  >
    <template #header>
      <p class="font-bold">Neuen Chat erstellen</p>
    </template>

    <div class="space-y-4 w-3xs xl:w-2xs">
      <UFormField label="Chat-Typ" name="chatType" required>
        <USelectMenu v-model="chatType" :items="items" class="w-48" />
      </UFormField>

      <UFormField
        :label="chatNameLabel"
        name="chatName"
        :required="chatType === 'Group-chat'"
      >
        <UInput
          v-model="chatName"
          class="w-full"
          :placeholder="chatNamePlaceholder"
        />
      </UFormField>

      <UFormField
        v-if="chatType === 'Group-chat'"
        label="Description (optional)"
        name="description"
      >
        <UTextarea
          v-model="description"
          class="w-full"
          placeholder="Add a description..."
          :rows="3"
        />
      </UFormField>

      <div class="flex gap-3 pt-2">
        <UButton
          class="flex-1"
          color="primary"
          @click="onCreate"
          :disabled="isCreateDisabled"
        >
          Erstellen
        </UButton>
        <UButton class="flex-1" variant="outline" @click="onCancel">
          Abbrechen
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  create: [data: { type: string; name: string; description?: string }];
  cancel: [];
}>();

const chatType = ref("Privat");
const chatName = ref("");
const description = ref("");

const items = ref(["Privat", "Group-chat"]);

const chatNameLabel = computed(() => {
  return chatType.value === "Group-chat"
    ? "Group-Name"
    : "Chat-Name (optional)";
});

const chatNamePlaceholder = computed(() => {
  return chatType.value === "Group-chat"
    ? "Add a groupname..."
    : "Add a name...";
});

const isCreateDisabled = computed(() => {
  if (chatType.value === "Group-chat") {
    return !chatName.value.trim();
  }
  return false;
});

function onCreate() {
  if (chatType.value === "Group-chat" && !chatName.value.trim()) {
    return;
  }

  emit("create", {
    type: chatType.value.toLowerCase(),
    name: chatName.value.trim(),
    description: description.value.trim() || undefined,
  });
}

function onCancel() {
  emit("cancel");
}

onMounted(() => {
  chatType.value = "Privat";
  chatName.value = "";
  description.value = "";
});
</script>
