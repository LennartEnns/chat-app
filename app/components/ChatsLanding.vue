<template>
    <div>
        <h1 class="headline-direct">{{ title }}</h1>
    <div
        v-for="(chatroom, index) in chatrooms"
        :key="chatroom.chatroom_id"
        :class="[
            'container-overlay',
            index === 0 ? 'first-message-container' : 'subsequent-message-container'
        ]">
        <!-- Avatar Section -->
        <div :class="type === 'direct' ? 'avatars-direct' : 'avatars-group'">
            <template v-if="type === 'direct'">
                <UChip inset color="primary">
                <UAvatar :src="(chatroom as DirectChatroomData).loggedUser.avatarUrl" size="lg" />
                </UChip>
            </template>

            <template v-else>
                <UAvatarGroup :max="1">
                <UChip 
                    v-for="user in (chatroom as GroupChatroomData).users" 
                    :key="user.id" 
                    inset 
                    color="primary">
                    <UAvatar :src="user.avatarUrl" size="lg" />
                </UChip>
                </UAvatarGroup>
            </template>
        </div>

        <!-- Message Count Badge -->
        <div class="count-new-messages">
            <UBadge
                class="font-bold rounded-full"
                size="md"
                color="primary"
                variant="outline"
                >
                {{ chatroom.new_messages }}
            </UBadge>
        </div>

        <!-- Button -->
        <div class="button-layer">
            <UButton
                class="newMessages custom-button-text"
                :block="true"
                :to="`/chat/${chatroom.chatroom_id}`"
            >
            {{ getChatroomDisplayName(chatroom) }}
            </UButton>
        </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { DirectChatroomData, GroupChatroomData } from '~/types/chatroom';

interface Props {
    title: string;
    chatrooms: (DirectChatroomData | GroupChatroomData)[];
    type: 'direct' | 'group';
}

const props = defineProps<Props>();

function getChatroomDisplayName(chatroom: DirectChatroomData | GroupChatroomData): string {
    if (props.type === 'direct') {
        return (chatroom as DirectChatroomData).loggedUser.username;
    } else {
        return (chatroom as GroupChatroomData).name;
    }
}
</script>