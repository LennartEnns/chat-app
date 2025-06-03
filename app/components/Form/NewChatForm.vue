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

      <UFormField label="Chat-Name" name="chatName" required>
        <UInput
          v-model="chatName"
          class="w-full"
          placeholder="Gib einen Namen ein..."
        />
      </UFormField>

      <UFormField
        v-if="chatType === 'Gruppe'"
        label="Beschreibung (optional)"
        name="description"
      >
        <UTextarea
          v-model="description"
          class="w-full"
          placeholder="Beschreibe die Gruppe..."
          :rows="3"
        />
      </UFormField>

      <div class="flex gap-3 pt-2">
        <UButton
          class="flex-1"
          color="primary"
          @click="onCreate"
          :disabled="!chatName.trim()"
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

const items = ref(["Privat", "Gruppe"]);

function onCreate() {
  if (!chatName.value.trim()) return;

  emit("create", {
    type: chatType.value.toLowerCase(), // "privat" oder "gruppe"
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
