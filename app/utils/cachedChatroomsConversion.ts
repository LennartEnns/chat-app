import type { CachedChatroomData, CachedChatroomsMap } from "~/types/chatroom";

type CachedChatroomsArray = CachedChatroomData[];
 /**
  * Converts an object of chatrooms with ids as the keys to an array sorted by last activity.
  */
export function chatroomsMapToArray(chatrooms: CachedChatroomsMap): CachedChatroomsArray {
  return Object.entries(chatrooms)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => {
      // Move to end of list if null (should never be the case!)
      if (!a.last_activity) return -1;
      if (!b.last_activity) return 1;
      // Sort descending by last activity
      return (new Date(b.last_activity).getTime()) - (new Date(a.last_activity).getTime());
    });
}

 /**
  * Converts an array of chatroom data objects to an object of chatrooms with ids as the keys
  */
export function chatroomsArrayToMap(chatrooms: CachedChatroomsArray): CachedChatroomsMap {
  return Object.fromEntries(
    chatrooms.map(({ id, ...rest }) => [id, rest])
  );
}
