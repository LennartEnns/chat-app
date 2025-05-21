<template>
  <div
    class="min-h-screen transition-colors duration-300"
    :class="isDarkMode ? 'dark' : ''"
  >
    <!-- Drawer (Sidebar) -->
    <USlideover v-model="isDrawerOpen" side="left">
      <div
        class="p-8 bg-gradient-to-b from-ui-secondary to-ui-secondary-dark h-full"
      >
        <h2 class="text-2xl font-bold text-ui-neutral mb-8">Task Dashboard</h2>
        <nav class="space-y-4">
          <UButton
            color="primary"
            variant="soft"
            size="md"
            class="w-auto text-ui-neutral hover:bg-ui-primaryMain-light/30"
          >
            <UIcon
              name="i-heroicons-clipboard-document-list"
              class="mr-2 text-ui-primaryMain-light"
            />
            Tasks
          </UButton>
          <UButton
            color="neutral"
            variant="soft"
            size="md"
            class="w-auto text-ui-neutral hover:bg-ui-neutral/20"
          >
            <UIcon name="i-heroicons-cog" class="mr-2 text-ui-neutral" />
            Settings
          </UButton>
        </nav>
      </div>
    </USlideover>

    <!-- Main Content -->
    <div class="flex flex-col">
      <!-- Header -->
      <header
        class="bg-gradient-to-r from-ui-bg to-ui-primaryMain/10 border-b border-ui-secondary/30"
      >
        <UContainer class="py-6 flex justify-between items-center">
          <div class="flex items-center gap-6">
            <UButton
              variant="ghost"
              @click="isDrawerOpen = true"
              class="md:hidden"
            >
              <UIcon
                name="i-heroicons-bars-3"
                class="text-ui-neutral text-2xl"
              />
            </UButton>
            <h1 class="text-3xl font-semibold text-ui-neutral">My Tasks</h1>
          </div>
          <UToggle
            v-model="isDarkMode"
            on-icon="i-heroicons-moon"
            off-icon="i-heroicons-sun"
            size="lg"
          />
        </UContainer>
      </header>

      <!-- Content -->
      <UContainer class="py-10">
        <!-- Form Section -->
        <UCard class="my-10 bg-ui-bg border-ui-info/30 shadow-lg">
          <template #header>
            <h2 class="text-xl font-semibold text-ui-primaryMain">
              Add New Task
            </h2>
          </template>
          <div class="space-y-6">
            <UInput
              v-model="taskName"
              placeholder="Enter task name"
              color="primary"
              size="md"
              :ui="{
                base: taskNameValid
                  ? 'border-ui-success focus:ring-ui-success-light'
                  : 'border-ui-error focus:ring-ui-error-light',
              }"
            />
            <USelect
              v-model="taskStatus"
              :options="statusOptions"
              placeholder="Select status"
              color="info"
              size="md"
              :ui="{ base: 'border-ui-info focus:ring-ui-info-light' }"
            />
            <UButton
              color="primary"
              variant="solid"
              size="md"
              class="w-auto hover:bg-ui-primaryMain-dark"
              @click="addTask"
            >
              Add Task
            </UButton>
          </div>
        </UCard>

        <!-- Alerts -->
        <UAlert
          v-if="showAlert"
          :color="alertType"
          variant="subtle"
          :title="alertType.charAt(0).toUpperCase() + alertType.slice(1)"
          :description="alertMessage"
          :icon="alertIcons[alertType]"
          class="my-10 bg-gradient-to-r from-ui-bg to-ui-bg/50 border-l-4"
          :ui="{ wrapper: 'border-' + alertType }"
        />

        <!-- Tasks Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UCard
            v-for="(task, index) in tasks"
            :key="index"
            class="bg-gradient-to-br from-ui-bg to-ui-secondary/10 border-2 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
            :class="{
              'border-ui-success': task.status === 'Done',
              'border-ui-warning': task.status === 'In Progress',
              'border-ui-primaryMain': task.status === 'To Do',
            }"
          >
            <template #header>
              <h3 class="text-lg font-medium text-ui-neutral">
                {{ task.name }}
              </h3>
            </template>
            <p class="text-sm text-ui-neutral/80">Status: {{ task.status }}</p>
            <div class="mt-6 flex gap-4">
              <UButton
                :color="
                  task.status === 'Done'
                    ? 'success'
                    : task.status === 'In Progress'
                    ? 'warning'
                    : 'primary'
                "
                variant="outline"
                size="sm"
                class="w-auto hover:bg-ui-bg/80"
              >
                {{ task.status === "Done" ? "Completed" : "Update" }}
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                class="w-auto hover:bg-ui-error-light/30"
              >
                Delete
              </UButton>
            </div>
          </UCard>
        </div>
      </UContainer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Reactive state
const isDarkMode = ref(false);
const isDrawerOpen = ref(false);
const taskName = ref("");
const taskStatus = ref(null); // Initialize as null to ensure placeholder shows
const showAlert = ref(false);
const alertType = ref("success");
const alertMessage = ref("");
const tasks = ref([
  { name: "Design Homepage", status: "To Do" },
  { name: "Code Backend", status: "In Progress" },
  { name: "Test Features", status: "Done" },
]);

// Status options for USelect
const statusOptions = ref([
  { label: "To Do", value: "To Do" },
  { label: "In Progress", value: "In Progress" },
  { label: "Done", value: "Done" },
]);

// Alert icons
const alertIcons = {
  success: "i-heroicons-check-circle",
  error: "i-heroicons-exclamation-circle",
};

// Computed property for input validation
const taskNameValid = computed(() => taskName.value.length >= 3);

// Add task with validation
const addTask = () => {
  if (taskNameValid.value && taskStatus.value) {
    tasks.value.push({ name: taskName.value, status: taskStatus.value });
    showAlert.value = true;
    alertType.value = "success";
    alertMessage.value = "Task added successfully!";
    taskName.value = "";
    taskStatus.value = null; // Reset to null to show placeholder
  } else {
    showAlert.value = true;
    alertType.value = "error";
    alertMessage.value = "Please enter a valid task name and status.";
  }
  setTimeout(() => (showAlert.value = false), 3000);
};
</script>

<style scoped>
/* Light Mode Palette */

/* Dark Mode Palette */

/* Apply CSS variables */
.bg-ui-bg {
  background-color: var(--ui-bg);
}
.text-ui-neutral {
  color: var(--ui-neutral);
}
.border-ui-primaryMain {
  border-color: var(--ui-primary);
}
.border-ui-secondary {
  border-color: var(--ui-secondary);
}
.border-ui-neutral {
  border-color: var(--ui-neutral);
}
.border-ui-success {
  border-color: var(--ui-success);
}
.border-ui-info {
  border-color: var(--ui-info);
}
.border-ui-warning {
  border-color: var(--ui-warning);
}
.border-ui-error {
  border-color: var(--ui-error);
}
.bg-ui-secondary\/20 {
  background-color: rgba(var(--ui-secondary-rgb, 126, 74, 84), 0.2);
}
.focus\:ring-ui-success-light:focus {
  --tw-ring-color: var(--ui-success-light);
}
.focus\:ring-ui-error-light:focus {
  --tw-ring-color: var(--ui-error-light);
}
.focus\:ring-ui-info-light:focus {
  --tw-ring-color: var(--ui-info-light);
}
.border-success {
  border-color: var(--ui-success);
}
.border-error {
  border-color: var(--ui-error);
}
.bg-ui-primaryMain-light\/30 {
  background-color: rgba(var(--ui-primary-light-rgb, 232, 164, 176), 0.3);
}
.bg-ui-neutral\/20 {
  background-color: rgba(var(--ui-neutral-rgb, 51, 51, 51), 0.2);
}
.bg-ui-error-light\/30 {
  background-color: rgba(var(--ui-error-light-rgb, 240, 113, 110), 0.3);
}
</style>
