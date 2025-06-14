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

  -- Those are only needed to display message authors in group chatroom
  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else msg.user_id
  end as user_id,
  case when msg.user_id = (select auth.uid()) or cr.type = 'direct'
    then null
    else p.username
  end as username
from public.messages msg
join public.profiles p on p.user_id = msg.user_id
join public.chatrooms cr on cr.id = msg.chatroom_id;
