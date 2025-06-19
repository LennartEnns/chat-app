create or replace view public.messages_view
with (security_invoker)
as
select
  (msg.user_id = (select auth.uid())) as is_own,

  -- User only needs to know message ID for own messages (to update/delete)
  case when msg.user_id = (select auth.uid())
    then msg.id
    else null
  end as id,
  msg.chatroom_id,
  msg.content,
  msg.created_at,
  msg.message_type,

  -- Those are only needed to display message authors in group chatroom
  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else msg.user_id
  end as user_id,
  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else p.username
  end as username,

  case when exists (select 1 from public.messages_to_media mtm where mtm.message_id = msg.id)
    then (
      select json_agg(
        json_build_object(
          'id', mtm.media_id,
          'type', mtm.type,
          'file_path', case 
            when mtm.type = 'image' then msg.user_id || '/image/' || mtm.media_id || '.jpg'
            when mtm.type = 'audio' then msg.user_id || '/audio/' || mtm.media_id || '.mp3'
            else null
          end
        )
      )
      from public.messages_to_media mtm 
      where mtm.message_id = msg.id
    )
    else null
  end as media

from public.messages msg
join public.profiles p on p.user_id = msg.user_id
join public.chatrooms cr on cr.id = msg.chatroom_id;
