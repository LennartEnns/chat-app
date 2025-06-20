import type { CachedChatroomsMap } from "~/types/chatroom";
import type { Message } from "~/types/messages/messageLoading"

/**
 * This composable is given a messages array ref to work on.
 * All manipulations on this array, including side effects, are performed in this composable.
 * It does NOT handle database/realtime operations/events, its only concern is the array.
 */
export const useLocalMessagesManipulator = (chatroomId: string, messages: Ref<Message[] | undefined>) => {
  const cachedChatrooms = useState<CachedChatroomsMap | undefined>('chatrooms');
  const cachedChatroom = computed(() => cachedChatrooms.value ? cachedChatrooms.value[chatroomId] : undefined);

  async function updatePreviewLastMessage(last_message: string | null, last_activity: Date) {
    // Update chatroom state
    if (cachedChatroom.value) {
      // Update last message/activity
      cachedChatroom.value.last_activity = last_activity.toISOString();
      cachedChatroom.value.last_message = last_message;
    }
  }

  async function insertOlderMessagesDescending(newMessages: Message[]) {
    if (!messages.value) return;
    // New messages are in descending order, so insert each one at the start of messages
    newMessages.forEach((newMsg) => messages.value!.unshift(newMsg));
  }
  async function appendMessage(msg: Message) {
    messages.value?.push(msg);
    updatePreviewLastMessage(msg.content, new Date(msg.created_at));
  }
  /**
   * Iterates through messages from end to start.
   * As soon as an older message is encountered, inserts the new one right after it.
   */
  async function appendMessageTimeAware(msg: Message) {
    if (!messages.value) return;
    let insertIndex = messages.value.length;
    while (insertIndex > 0 && messages.value[insertIndex - 1]!.created_at.getTime() > msg.created_at.getTime()) {
      insertIndex--;
    }
    messages.value = messages.value.toSpliced(insertIndex, 0, msg);
    if (messages.value[messages.value.length - 1]!.id === msg.id) {
      updatePreviewLastMessage(msg.content, new Date(msg.created_at));
    }
  }
  async function deleteMessage(index: number) {
    messages.value = messages.value?.toSpliced(index, 1);
    if (cachedChatroom.value && index === messages.value?.length) {
      // Last message deleted => Update chatroom state
      const newLastMsg = messages.value[messages.value.length - 1];
      updatePreviewLastMessage(newLastMsg?.content ?? null, newLastMsg?.created_at ?? new Date());
    }
  }
  async function updateMessageContent(index: number, newContent: string) {
    if (!messages.value || messages.value.length <= index) return;

    const oldMsg = messages.value[index]!;
    const newMsg = {
      ...oldMsg,
      content: newContent,
    };
    messages.value = messages.value.toSpliced(index, 1, newMsg); // Remove old + insert new
    if (cachedChatroom.value && index === messages.value.length - 1) {
      // Last message updated => Update chatroom state
      updatePreviewLastMessage(newContent, newMsg.created_at);
    }
  }

  return {
    insertOlderMessagesDescending,
    appendMessage,
    appendMessageTimeAware,
    deleteMessage,
    updateMessageContent,
  };
}
