import type { Tables } from '~~/database.types';
import type { RequireNonNull } from './tsUtils/helperTypes';

export interface DirectChatroomData {
    chatroom_id: string;
    new_messages: number;
    user1: UserData;
    user2: UserData;
    loggedUser: UserData;
}

export interface GroupChatroomData {
    chatroom_id: string;
    name: string;
    new_messages: number;
    avatar_url: string | undefined;
    users: UserData[];
}

export type CachedChatroomData = RequireNonNull<Tables<'chatrooms_preview'>, 'id' | 'last_activity' | 'last_inside' | 'number_new_messages'>;
export type CachedChatroomsMap = Record<NonNullable<Tables<'chatrooms_preview'>['id']>, Omit<CachedChatroomData, 'id'> | undefined>
export type CachedChatroomsAvatarUrlMap = Record<keyof CachedChatroomsMap, string | undefined>
