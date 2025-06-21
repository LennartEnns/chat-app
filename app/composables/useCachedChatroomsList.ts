import type { CachedChatroomData, CachedChatroomsMap } from "~/types/chatroom";

export const useCachedChatroomsList = () => {
  const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');

  // Interface between chatrooms state (Map) and local list (Array)
  const chatrooms = computed<CachedChatroomData[] | undefined>({
    get: () => {
      return cachedChatrooms.value ? chatroomsMapToArray(cachedChatrooms.value) : undefined;
    },
    set: (rooms) => {
      cachedChatrooms.value = rooms ? chatroomsArrayToMap(rooms) : undefined;
    }
  });

  return chatrooms;
}
