import type { CachedChatroomsMap } from "~/types/chatroom";

export const useCachedChatroom = (chatroomId: string) => {
  const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');
  const cachedChatroomDataObject = computed({
    get: () => {
      if (!cachedChatrooms.value) return undefined;
      const obj = cachedChatrooms.value[chatroomId];
      if (!obj) return undefined;
      return { ...obj, id: chatroomId };
    },
    set: (obj) => {
      if (!cachedChatrooms.value || !obj) return;
      const { id, ...setObj } = obj;
      cachedChatrooms.value[chatroomId] = setObj;
    },
  });
  watch(cachedChatroomDataObject, (val) => console.log(val), { deep: true });

  return cachedChatroomDataObject;
}
