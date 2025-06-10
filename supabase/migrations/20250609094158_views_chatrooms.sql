create or replace view public.group_chatrooms_extended as
select
  gc.*,
  coalesce(
    (
      select max(m.created_at)
      from public.messages m
      where m.chatroom_id = gc.chatroom_id
    ),
    c.created_at
  ) as last_activity,
  (
    select utg.role
    from public.user_to_group utg
    where utg.chatroom_id = gc.chatroom_id
      and utg.user_id = (select auth.uid())
    limit 1
  ) as current_user_role
from public.group_chatrooms gc
join public.chatrooms c on c.id = gc.chatroom_id;
