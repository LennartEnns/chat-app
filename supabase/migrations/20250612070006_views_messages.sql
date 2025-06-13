create or replace view public.messages_view
with (security_invoker)
as
select
  case when msg.user_id = (select auth.uid())
    then msg.id -- User only needs to know ID for own messages
    else null
  end as id,
  msg.chatroom_id,
  msg.content,
  msg.created_at,
  case when msg.user_id = (select auth.uid())
    then null
    else msg.user_id
  end as user_id,
  case when msg.user_id = (select auth.uid())
    then null
    else coalesce(p.displayname, p.username)
  end as username
from public.messages msg
join public.profiles p on p.user_id = msg.user_id;
