-- TODO: Create topic check function
-- User should not be able to subscribe to 2 non-preview chatroom topics at the same time!


create policy "Members can receive message broadcasts"
on "realtime"."messages"
for select
to authenticated
using (
  can_user_listen_to_topic((select auth.uid()), (select realtime.topic()))
  and realtime.messages.extension in ('broadcast')
);

-- TODO: Create trigger function
-- broadcast_messages_change() => Detect operation using TG_OP
-- Should perform the necessary sends using realtime.send()
-- => "room:[id]" and "preview:[id]"

-- 'room:[id]' for when the user is actually inside and needs to receive full messages
-- => 'insert' event: All columns except chatroom_id
-- => 'update' event: Only id and new content
-- => 'delete' event: Only id

-- 'preview:[id]' for sending only truncated new message content (no other columns) on insert

-- CLIENT-SIDE:
-- Client should subscribe to preview of all their chatrooms
-- Handle subscription/unsubscription for "room" in onMounted/onUnmounted of chat/[id]/index.vue
-- Handle subscription/unsubscription for "preview" in chat layout (Unsubscribe from chat preview when opening that chatroom, resubscribe when closing!)

create trigger trigger_broadcast_messages_change
after insert or update or delete
on public.messages
for each row
execute function broadcast_messages_change();
