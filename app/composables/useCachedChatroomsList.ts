import type { CachedChatroomsMap } from "~/types/chatroom";
import type { Tables } from "~~/database.types";

export const useCachedChatroomsList = () => {
  const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');

  // Interface between chatrooms state (Map) and local list (Array)
  const chatrooms = computed<Tables<'chatrooms_preview'>[] | undefined>({
    get: () => {
      return cachedChatrooms.value ? chatroomsMapToArray(cachedChatrooms.value) : undefined;
    },
    set: (rooms) => {
      cachedChatrooms.value = rooms ? chatroomsArrayToMap(rooms) : undefined;
    }
  });

  return chatrooms;
}
