create or replace view public.chatrooms_with_last_activity as
select
  c.*,
  coalesce(
    (
      select max(m.created_at)
      from public.messages m
      where m.chatroom_id = c.id
    ),
    c.created_at
  ) as last_activity
from public.chatrooms c;

-- Use this to preview a list of all chats of a user
create or replace view public.chatrooms_preview as
select
  cwla.id, cwla.type, cwla.last_activity,

  case when cwla.type = 'group' then null
  else (
    select 
      case when ((select auth.uid()) = dc.user1_id) then dc.user2_id
      else dc.user1_id
      end
    from public.direct_chatrooms dc
    where dc.chatroom_id = cwla.id
  )
  end as other_user_id, -- Only used for direct chatrooms

  case when cwla.type = 'group' then
    (
      select gc.name from public.group_chatrooms gc
      where gc.chatroom_id = cwla.id
    )
  else
    (
      with subquery as (
        select 
          case when ((select auth.uid()) = dc.user1_id) then dc.user2_id
          else dc.user1_id
          end as other_user_id
        from public.direct_chatrooms dc
        where dc.chatroom_id = cwla.id
      )
      select coalesce(p.displayname, p.username) as name from public.profiles p
      where p.user_id = (select other_user_id from subquery)
    )
  end
  as name,

  (
    select msg.content
    from public.messages msg
    where chatroom_id = cwla.id
    order by msg.created_at desc
    limit 1
  ) as last_message
from public.chatrooms_with_last_activity cwla;

create or replace view public.group_chatrooms_last_activity_current_role as
select
  gc.*,
  cwla.last_activity,
  (
    select utg.role
    from public.user_to_group utg
    where utg.chatroom_id = gc.chatroom_id
      and utg.user_id = (select auth.uid())
    limit 1
  ) as current_user_role -- Role of current user in group
from public.group_chatrooms gc
join public.chatrooms_with_last_activity cwla on cwla.id = gc.chatroom_id;

create or replace view public.group_chatroom_members as
select
  user_to_group.chatroom_id,
  pf.user_id,
  user_to_group.role,
  pf.description,
  coalesce(pf.displayname, pf.username) as name
from public.profiles pf
join public.user_to_group on pf.user_id = user_to_group.user_id;