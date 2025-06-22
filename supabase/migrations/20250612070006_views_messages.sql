create or replace view public.messages_view
with (security_invoker)
as
select
  (msg.user_id = (select auth.uid())) as is_own,

  msg.id as id,
  msg.chatroom_id,
  msg.content,
  msg.created_at,
  msg.message_type,

  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else msg.user_id
  end as user_id,
  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else p.username
  end as username,

  COALESCE(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', mtm.media_id,
          'type', mtm.type,
          'file_path', case 
            when mtm.type = 'image' then msg.user_id || '/image/' || mtm.media_id || '.jpg'
            else null
          end
        )
      )
      from public.messages_to_media mtm 
      where mtm.message_id = msg.id
    ),
    '[]'::jsonb
  ) as media

from public.messages msg
join public.profiles p on p.user_id = msg.user_id
join public.chatrooms cr on cr.id = msg.chatroom_id;
