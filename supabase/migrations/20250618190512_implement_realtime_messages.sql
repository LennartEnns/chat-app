-- 'room:[id]' for when the user is actually inside and needs to receive full messages
-- => 'insert' event: All columns except chatroom_id
-- => 'update' event: Only id and new content
-- => 'delete' event: Only id

-- 'preview:[id]' for sending only truncated new message content (no other columns) on insert

-- CLIENT-SIDE:
-- Client should subscribe to preview of all their chatrooms
-- Handle subscription/unsubscription for "room" in onMounted/onUnmounted of chat/[id]/index.vue
-- Handle subscription/unsubscription for "preview" in chat layout (Unsubscribe from chat preview when opening that chatroom, resubscribe when closing!)

create function utils.can_user_listen_to_topic(uid uuid, topic text)
returns bool
language plpgsql
security definer set search_path = ''
stable
as $$
declare
  topic_parts text[];
  chatroom_id uuid;
  user_role public.chatroom_role;
begin
  select string_to_array(topic, ':') into topic_parts;
  if array_length(topic_parts, 1) != 2 then
    return false;
  end if;
  if topic_parts[1] not in ('room', 'preview') then
    return false;
  end if;

  select (topic_parts[2]::uuid) into chatroom_id;
  select utils.get_role_in_chatroom(uid, chatroom_id) into user_role;
  if user_role is null then
    return false;
  end if;
  return true;

exception
  when others then
    return false;
end;
$$;

create policy "Members can receive message broadcasts"
on "realtime"."messages"
for select
to authenticated
using (
  utils.can_user_listen_to_topic((select auth.uid()), (select realtime.topic()))
  and realtime.messages.extension in ('broadcast')
);

-- TODO: Create trigger function
-- broadcast_messages_change() => Detect operation using TG_OP
-- Should perform the necessary sends using realtime.send()
-- => "room:[id]" and "preview:[id]"
create function broadcast_messages_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  room_topic text;
  preview_topic text;
  msg_username text;
begin
  select 'room:' || (coalesce(OLD.chatroom_id, NEW.chatroom_id)::text) into room_topic;
  if TG_OP = 'INSERT' then
    select 'preview:' || (NEW.chatroom_id::text) into preview_topic;
    select p.username from public.profiles p where p.user_id = NEW.user_id into msg_username;
    -- Send insert events to room and preview channel
    perform realtime.send(
      jsonb_build_object(
        'id', NEW.id,
        'content', NEW.content,
        'created_at', NEW.created_at,
        'user_id', NEW.user_id,
        'username', msg_username
      ), -- JSONB Payload
      'insert', -- Event
      room_topic, -- Topic
      true -- Public / Private Flag
    );
    perform realtime.send(
      jsonb_build_object(
        'content', NEW.content
      ),
      'insert',
      preview_topic,
      true
    );
    return null;
  elsif TG_OP = 'UPDATE' then
    perform realtime.send(
      jsonb_build_object(
        'id', NEW.id,
        'content', NEW.content
      ),
      'update',
      room_topic,
      true
    );
    return null;
  elsif TG_OP = 'DELETE' then
    perform realtime.send(
      jsonb_build_object(
        'id', OLD.id
      ),
      'delete',
      room_topic,
      true
    );
    return null;
  end if;
  return null;
end;
$$;
revoke all on function broadcast_messages_change() from authenticated, anon;

create trigger trigger_broadcast_messages_change
after insert or update or delete
on public.messages
for each row
execute function broadcast_messages_change();
