-- 'room:[id]' for when the user is actually inside and needs to receive full messages
-- => 'insert' event: All columns except chatroom_id
-- => 'update' event: Only id and new content
-- => 'delete' event: Only id

-- 'preview:[id]' for sending only the data needed for previewing chatrooms and their content
-- => 'insert-msg' event: Truncated message content (for previewing new last message) and created_at (to avoid race conditions) => Change last msg, unread msgs ++
-- => 'update-last' event: Truncated message content => Change last msg, unread msgs stays unchanged
-- => 'delete-msg' event: created_at => Client decides whether it was a new message. If yes, unread msgs --. If it was the last message, followed by update-last.

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
  cid uuid;
  room_topic text;
  preview_topic text;
  msg_username text;
  latest_msg_id uuid;
begin
  select coalesce(OLD.chatroom_id, NEW.chatroom_id) into cid;
  select 'room:' || (cid::text) into room_topic;
  select 'preview:' || (cid::text) into preview_topic;
  if TG_OP = 'INSERT' then
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
        'content', (select utils.truncate(NEW.content, 30)),
        'created_at': NEW.created_at,
      ),
      'insert-msg',
      preview_topic,
      true
    );
    return null;
  elsif TG_OP = 'UPDATE' then
    select msg.id from public.messages msg
    where msg.chatroom_id = cid
    order by created_at desc limit 1
    into latest_msg_id;

    perform realtime.send(
      jsonb_build_object(
        'id', NEW.id,
        'content', NEW.content
      ),
      'update',
      room_topic,
      true
    );
    -- Only send update-last if the latest message has been updated
    if NEW.id = latest_msg_id then
      perform realtime.send(
        jsonb_build_object(
          'content', (select utils.truncate(NEW.content, 30)),
        ),
        'update-last',
        preview_topic,
        true
      );
    end if;
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

    perform realtime.send(
      jsonb_build_object(
        'created_at', OLD.created_at,
      ),
      'delete-msg',
      preview_topic,
      true
    );
    -- Only send update-last if the latest message has been deleted
    if OLD.created_at > (
      select max(created_at) from public.messages msg
      where msg.chatroom_id = cid
    ) then
      perform realtime.send(
        jsonb_build_object(
          -- Truncated content of new last message if it exists, otherwise null
          'content', (select utils.truncate(
            select msg.content from public.messages msg
            where msg.chatroom_id = cid
            order by created_at desc limit 1
          ))
        ),
        'update-last',
        preview_topic,
        true
      );
    end if;
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
