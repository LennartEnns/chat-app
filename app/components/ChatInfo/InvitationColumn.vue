<template>
  <div class="pb-5 text-neutral-700 pt-5 md:pt-0 dark:text-white">
    <p :class="`font-bold flex justify-center ${textTheme}`">Invitations</p>
  </div>
  <div class="pb-5">
    <div
      v-for="(invitation, index) in props.invitations"
      :key="index"
      class="ring-0 glassContainer text-neutral-700 dark:text-white member invitation"
    >
      <UAvatar
        class="justify-self-center"
        icon="i-lucide-user"
        :src="
          (invitation.invitee_id && getAvatarUrl(invitation.invitee_id)) ||
          undefined
        "
      />
      <div
        class="flex flex-col items-center justify-center truncate px-[0.6rem]"
      >
        <div class="truncate w-full text-center">
          {{ invitation.invitee_username }}
        </div>
      </div>
      <UButton
        v-if="editBoolean"
        icon="i-lucide-trash-2"
        class="size-fit"
      ></UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Tables } from "~~/database.types";

type ChatInvitation = Pick<
  Tables<"group_invitations_preview">,
  "id" | "invitee_id" | "as_role" | "invitee_username"
>;

const props = defineProps<{
  invitations: ChatInvitation[];
  editBoolean: boolean;
  textTheme: string;
}>();
</script>

<style></style>
