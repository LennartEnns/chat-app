import type { Tables } from '~~/database.types';

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


export type CachedChatroomData = Tables<'chatrooms_preview'> & { avatarUrl: string | undefined };
export type CachedChatroomsMap = Record<NonNullable<Tables<'chatrooms_preview'>['id']>, Omit<CachedChatroomData, 'id'> | undefined>
