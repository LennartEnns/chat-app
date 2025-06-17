import type { Message } from "~/types/messages/messageLoading";
import { logPostgrestError } from "~~/errors/postgrestErrors";

const scrollTopTreshold = 50; // px
const messagesChunkSize = 20; // Load max. 20 messages at once
const alwaysFutureDate = new Date(86400000000000);

export const useLazyFetchedMessages = (
  chatroomId: string,
  messagesContainer: Ref<HTMLElement | null>,
) => {
  const supabase = useSupabaseClient();
  const operationFeedbackHandler = useOperationFeedbackHandler();
  const containerScrollTop = ref(0);
  const almostAtTheTop = computed(() =>
    containerScrollTop.value <= scrollTopTreshold
  );

  const { data: messages } = useAsyncData(
    `chatMessages-${chatroomId}`,
    async () => {
      return (await fetchEarlierMessages(false)).toReversed();
    },
  );
  function getEarliestMessageTime() {
    return (!messages.value || messages.value.length === 0)
      ? alwaysFutureDate
      : new Date(messages.value[0]!.created_at);
  }

  let reachedEarliestMessage = false;

  async function updateScrollTop() {
    if (messagesContainer.value) {
      containerScrollTop.value = messagesContainer.value.scrollTop;
    }
  }

  async function insertMessages(newMessages: Message[]) {
    if (!messages.value || newMessages.length === 0) return;
    const oldScrollHeight = messagesContainer.value?.scrollHeight ?? 0;
    // New messages are in descending order, so insert each one at the start of messages
    newMessages.forEach((newMsg) => messages.value!.unshift(newMsg));
    // Adjust scrollTop to keep the view "pinned"
    await nextTick(() => {
      if (!messagesContainer.value) return;
      const container = messagesContainer.value;
      const newScrollHeight = container.scrollHeight;
      container.scrollTo({
        top: container.scrollTop + (newScrollHeight - oldScrollHeight),
        behavior: "instant", // Override smooth scrolling
      });
    });
  }
  async function fetchEarlierMessages(checkBeforeTime: boolean) {
    let query = supabase.from("messages_view")
      .select("is_own, id, content, created_at, user_id, username")
      .eq("chatroom_id", chatroomId)
      .order("created_at", { ascending: false })
      .limit(messagesChunkSize);
    if (checkBeforeTime) {
      query = query.lt("created_at", getEarliestMessageTime().toISOString());
    }
    const { data, error } = await query;

    if (error) {
      logPostgrestError(error, "message fetching");
      operationFeedbackHandler.displayError("Could not load messages");
      return [];
    }
    if (data) {
      if (data.length === 0) {
        reachedEarliestMessage = true;
        return [];
      }
      const dataWithDates = data.map((msg) => ({
        ...msg,
        created_at: new Date(msg.created_at!),
      })) as Message[];

      return dataWithDates;
    }
    return [];
  }

  watch(almostAtTheTop, async (val) => {
    if (val && !reachedEarliestMessage) {
      const newMsgs = await fetchEarlierMessages(true);
      insertMessages(newMsgs);
    }
  });

  onMounted(() => {
    messagesContainer.value?.addEventListener("scroll", updateScrollTop);
  });
  onUnmounted(() => {
    messagesContainer.value?.removeEventListener("scroll", updateScrollTop);
  });

  async function sendMessage(content: string) {
    const newId = crypto.randomUUID();
    const { error } = await supabase.from("messages").insert({
      id: newId,
      chatroom_id: chatroomId,
      content,
    });

    if (error) {
      logPostgrestError(error, "message insert");
      operationFeedbackHandler.displayError("Could not send the message");
      return;
    }
    messages.value?.push({
      id: newId,
      content,
      created_at: new Date(),
      message_type: "text",
      // null because it's the user's own message
      user_id: null,
      username: null,
      is_own: true,
    });
  }
  async function deleteMessage(id: string, index: number) {
    // Request deletion
    const { error } = await supabase.from("messages")
      .delete()
      .eq("id", id);

    if (error) {
      logPostgrestError(error, "message deletion");
      operationFeedbackHandler.displayError("Could not delete message");
      return;
    }

    // Remove message from local list after successful deletion
    messages.value = messages.value?.toSpliced(index, 1);
  }
  async function updateMessage(id: string, index: number, newContent: string) {
    // Request update
    const { error } = await supabase.from("messages")
      .update({
        content: newContent,
      })
      .eq("id", id);

    if (error) {
      logPostgrestError(error, "message update");
      operationFeedbackHandler.displayError("Could not update message");
      return;
    }

    // Update displayed message after successful db update
    if (!messages.value || messages.value.length <= index) return;
    const oldMsg = messages.value[index]!;
    const newMsg = {
      ...oldMsg,
      content: newContent,
    };
    messages.value = messages.value.toSpliced(index, 1, newMsg); // Remove old + insert new
  }

  return {
    messages,
    sendMessage,
    deleteMessage,
    updateMessage,
  };
};
