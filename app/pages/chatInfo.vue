<template>
  <NuxtLayout name="logged-in">
    <div class="grid grid-cols-4 h-full">
      <div class="flex flex-col items-center p-5">
        <div class="pt-10 pb-5">
          <div class="max-w-fit">
            <UAvatar
              class="border-2 border-defaultNeutral-700"
              src="https://github.com/benjamincanac.png"
              icon="i-lucide-user"
              :ui="{ root: 'size-fit' }"
            />
          </div>
        </div>
        <div class="py-5"><p class="text-[20px]">Groupname</p></div>
        <div class="py-5 text-center">
          Description: Hello World! fjsdkjfksdjaf dsjafksjad fs dfjsad jfklj
        </div>
      </div>
      <div
        class="flex flex-col items-center col-span-2 px-5 relative border border-defaultNeutral-700 border-t-0 border-b-0"
      >
        <div class="pb-5 text-neutral-700 dark:text-white">
          <p>Members</p>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <div
            class="ring-0 glassContainer text-neutral-700 dark:text-white member"
          >
            <div class="flex max-h-fit flex-col items-center">
              <UAvatar class="mb-1" src="https://github.com/nuxt.png" />
              <UBadge size="xs" class="font-bold rounded-full">Member</UBadge>
            </div>
            <div class="flex flex-col justify-center px-[0.6rem]">
              <p class="truncate w-full flex font-bold">Name Lastname</p>
              <p class="line-clamp-2 w-full leading-none">
                User messages are now saved to the database and loaded on
                page-reload.
              </p>
            </div>
          </div>
        </div>
        <UButton
          size="xl"
          icon="i-lucide-plus"
          class="absolute bottom-5 right-5"
          >Add member</UButton
        >
      </div>
      <div class="flex flex-col items-center px-5">
        <div class="pb-5 text-neutral-700 dark:text-white">
          <p>Invitations</p>
        </div>
        <div class="pb-5">
          <div
            class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation"
          >
            <UAvatar
              class="justify-self-center"
              src="https://github.com/nuxt.png"
            />
            <div
              class="flex flex-col items-center justify-center truncate px-[0.6rem]"
            >
              <div class="truncate w-full text-center">
                Peterskotstube wrkegjtlwkjertlwkejrce
              </div>
            </div>
            <UButton icon="i-lucide-trash-2" class="size-fit"></UButton>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts"></script>

<style>
@import url("~/assets/css/chatInfo.css");
</style>
