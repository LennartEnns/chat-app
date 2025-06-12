create or replace view public.messages_view
with (security_invoker)
as
select
  msg.id,
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
