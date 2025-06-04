<template>
  <UCard
    variant="subtle"
    class="border-1 border-gray-500"
    :ui="{
      header: 'border-none pb-1 text-lg',
    }"
  >
    <template #header>
      <p class="font-bold">Create new Chat</p>
    </template>

    <div class="space-y-4">
      <UFormField label="Chat-type" name="chatType" required>
        <USelectMenu v-model="chatType" :items="items" class="w-full" />
      </UFormField>

      <UFormField
        v-if="chatType === 'Group-chat'"
        label="Choose an image"
        name="image"
      >
        <div class="flex items-center gap-4">
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            @change="onFileSelected"
            class="hidden"
          />

          <div
            class="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center cursor-pointer relative"
            :class="{ 'bg-gray-200': !chatImagePreview }"
            @click="openFileInput"
          >
            <img
              v-if="chatImagePreview"
              :src="chatImagePreview"
              alt="Chat image preview"
              class="w-full h-full object-cover"
            />
            <UIcon
              v-else
              name="i-heroicons-photo"
              class="text-gray-500 text-3xl"
            />
            <div
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-200"
              v-if="chatImagePreview"
            >
              <UIcon
                name="i-heroicons-pencil-square"
                class="text-white text-xl"
              />
            </div>
          </div>
          <span class="text-gray-700 text-sm">Choose image (optional)</span>
        </div>
      </UFormField>

      <UFormField
        v-if="chatType === 'Group-chat'"
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
            placeholder="Choose a user..."
            class="w-full"
          />
        </div>

        <div v-else class="space-y-2">
          <USelectMenu
            v-model="userToAdd"
            :items="availableUsersForGroup"
            searchable
            placeholder="Add a user..."
            class="w-full"
            @update:model-value="addUserToGroup"
          />

          <div v-if="selectedUsers.length > 0" class="space-y-1">
            <p class="text-sm text-gray-600">User:</p>
            <div class="flex flex-wrap gap-2 w-full">
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
          Create
        </UButton>
        <UButton class="flex-1" variant="outline" @click="onCancel">
          Cancel
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

const emit = defineEmits<{
  create: [
    data: {
      type: string;
      name: string;
      description?: string;
      users: string[];
      image?: File | null;
    }
  ];
  cancel: [];
}>();

interface User {
  label: string;
  value: string;
}

const chatType = ref("Privat");
const chatName = ref("");
const description = ref("");
const selectedUser = ref<User | null>(null);
const selectedUsers = ref<User[]>([]);
const userToAdd = ref<User | null>(null);
const chatImage = ref<File | null>(null);
const chatImagePreview = ref<string | null>(null);

const fileInput = ref<HTMLInputElement | null>(null);

const availableUsers = ref<User[]>([
  { label: "Jakobyte", value: "user1" },
  { label: "Vaterkinds", value: "user2" },
  { label: "Lennator", value: "user3" },
]);

const userSelectionLabel = computed(() => {
  return chatType.value === "Gruppe" ? "Add user" : "Choose user";
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
  if (chatType.value === "Group-chat") {
    return !chatName.value.trim() || selectedUsers.value.length === 0;
  }

  if (chatType.value === "Privat") {
    return !selectedUser.value;
  }

  return false;
});

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    chatImage.value = input.files[0];
    chatImagePreview.value = URL.createObjectURL(input.files[0]);
  } else {
    chatImage.value = null;
    chatImagePreview.value = null;
  }
}

function openFileInput() {
  fileInput.value?.click();
}

function onCreate() {
  if (chatType.value === "Group-chat") {
    if (!chatName.value.trim() || selectedUsers.value.length === 0) {
      return;
    }
  }

  if (chatType.value === "Privat" && !selectedUser.value) {
    return;
  }

  let userList: string[] = [];
  let chatNameToUse: string | undefined = undefined;

  if (chatType.value === "Privat" && selectedUser.value) {
    userList = [selectedUser.value.value];
  } else if (chatType.value === "Group-chat") {
    userList = selectedUsers.value.map((user) => user.value);
    chatNameToUse = chatName.value.trim();
  }

  emit("create", {
    type: chatType.value.toLowerCase(),
    name: chatNameToUse || "",
    description:
      chatType.value === "Group-chat"
        ? description.value.trim() || undefined
        : undefined,
    users: userList,
    image: chatType.value === "Group-chat" ? chatImage.value : null,
  });
}

function onCancel() {
  chatImage.value = null;
  chatImagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
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
  chatName.value = "";
  description.value = "";
  chatImage.value = null;
  chatImagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
});

onMounted(() => {
  chatType.value = "Privat";
  chatName.value = "";
  description.value = "";
  selectedUser.value = null;
  selectedUsers.value = [];
  chatImage.value = null;
  chatImagePreview.value = null;
});
</script>
