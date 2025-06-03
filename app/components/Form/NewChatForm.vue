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

      <UFormField :label="userSelectionLabel" name="users" required>
        <div v-if="chatType === 'Privat'">
          <USelectMenu
            v-model="selectedUser"
            :items="availableUsers"
            searchable
            placeholder="Wähle einen Benutzer aus..."
            class="w-full"
          />
        </div>

        <div v-else class="space-y-2">
          <USelectMenu
            v-model="userToAdd"
            :items="availableUsersForGroup"
            searchable
            placeholder="Benutzer hinzufügen..."
            class="w-full"
            @update:model-value="addUserToGroup"
          />

          <div v-if="selectedUsers.length > 0" class="space-y-1">
            <p class="text-sm text-gray-600">Ausgewählte Benutzer:</p>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="user in selectedUsers"
                :key="user.value"
                color="primary"
                variant="subtle"
                class="flex items-center gap-1"
              >
                {{ user.label }}
                <UButton
                  icon="i-heroicons-x-mark-20-solid"
                  color="primary"
                  variant="ghost"
                  @click="removeUserFromGroup(user)"
                />
              </UBadge>
            </div>
          </div>
        </div>
      </UFormField>

      <div class="flex gap-3 pt-2">
        <UButton
          class="flex-1"
          color="primary"
          :disabled="isCreateDisabled"
          @click="onCreate"
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
  create: [
    data: {
      type: string;
      name: string;
      description?: string;
      users: string[];
    }
  ];
  cancel: [];
}>();

const chatType = ref("Privat");
const chatName = ref("");
const description = ref("");
const selectedUser = ref<User | null>(null);
const selectedUsers = ref<User[]>([]);
const userToAdd = ref<User | null>(null);

// Mock user
const availableUsers = ref<User[]>([
  { label: "Jakobyte", value: "user1" },
  { label: "Vaterkinds", value: "user2" },
  { label: "Lennator", value: "user3" },
]);

const userSelectionLabel = computed(() => {
  return chatType.value === "Gruppe"
    ? "Benutzer hinzufügen"
    : "Benutzer auswählen";
});

const availableUsersForGroup = computed(() => {
  return availableUsers.value.filter(
    (user) =>
      !selectedUsers.value.some((selected) => selected.value === user.value)
  );
});

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
  if (chatType.value === "Gruppe") {
    return !chatName.value.trim();
  }

  if (chatType.value === "Privat") {
    return !selectedUser.value;
  }

  return false;
});

function onCreate() {
  if (chatType.value === "Gruppe" && !chatName.value.trim()) {
    return;
  }

  if (chatType.value === "Privat" && !selectedUser.value) {
    return;
  }

  let userList: string[] = [];
  if (chatType.value === "Privat" && selectedUser.value) {
    userList = [selectedUser.value.value];
  } else if (chatType.value === "Gruppe") {
    userList = selectedUsers.value.map((user) => user.value);
  }

  emit("create", {
    type: chatType.value.toLowerCase(),
    name: chatName.value.trim(),
    description: description.value.trim() || undefined,
    users: userList,
  });
}

function onCancel() {
  emit("cancel");
}

function addUserToGroup(user: User | null) {
  if (user && !selectedUsers.value.some((u) => u.value === user.value)) {
    selectedUsers.value.push(user);
    userToAdd.value = null;
  }
}

function removeUserFromGroup(user: User) {
  selectedUsers.value = selectedUsers.value.filter(
    (u) => u.value !== user.value
  );
}

watch(chatType, () => {
  selectedUser.value = null;
  selectedUsers.value = [];
  userToAdd.value = null;
});

onMounted(() => {
  chatType.value = "Privat";
  chatName.value = "";
  description.value = "";
  selectedUser.value = null;
  selectedUsers.value = [];
});
</script>
