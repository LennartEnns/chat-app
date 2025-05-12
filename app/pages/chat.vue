<template>
  <UContainer class="alignment">
    <UContainer class="align-column">
      <UButton
        class="profile-picture"
        :avatar="{
          src: 'https://avatars.githubusercontent.com/u/182207917?v=4',
        }"
        color="neutral"
        variant="outline"
      ></UButton>
    </UContainer>
    <UContainer class="align-column scroll-smooth">
      <UModal class="bar-item" v-model:open="open">
        <UButton
          label="Search users..."
          color="neutral"
          variant="subtle"
          icon="i-lucide-search"
        />
        <template #content>
          <UCommandPalette
            close
            :groups="[{ id: 'users', items: users }]"
            @update:open="open = $event"
          />
        </template>
      </UModal>
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
    </UContainer>
    <UContainer class="align-column">
      <UCard class="bar-item">
        <Placeholder class="h-32" />
      </UCard>
      <UTextarea
        :avatar="{
          src: 'https://github.com/nuxt.png',
        }"
        disabled
        class="message"
        autoresize
        model-value="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
      />
      <UTextarea
        :avatar="{
          src: 'https://github.com/nuxt.png',
        }"
        disabled
        class="message"
        autoresize
        model-value="Lorem fjdksj kljaskl jdkl jk"
      />
      <UContainer class="write">
        <UTextarea
          class="full"
          placeholder="Write a message..."
          v-model="value"
        />
        <UButton><Icon name="ic:baseline-send" /></UButton>
      </UContainer>
    </UContainer>
  </UContainer>
</template>

<script setup>
const value = ref("");
</script>

<style>
@import url("~/assets/css/chat.css");
</style>
