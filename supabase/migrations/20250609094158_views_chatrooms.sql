create function utils.truncate(t text, len int)
returns text
language plpgsql
security definer set search_path = ''
stable
as $$
begin
  return case
    when length(t) > len
    then left(t, len) || '...'
    else t
  end;
end;
$$;


create or replace view public.chatrooms_with_last_activity
with (security_invoker)
as
select
  c.*,
  coalesce(
    (
      select max(m.created_at)
      from public.messages m
      where m.chatroom_id = c.id
      and m.user_id != (select auth.uid())
    ),
    c.created_at
  ) as last_activity
from public.chatrooms c;

create or replace view public.group_chatrooms_last_activity_current_role
with (security_invoker)
as
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

-- Use this to preview a list of all chats of a user
create or replace view public.chatrooms_preview
with (security_invoker)
as
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
  end as other_user_id, -- Only used for direct chatrooms (avatar fetching)

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

  utac.last_inside,
  (
    select utils.truncate(msg.content, 30)
    from public.messages msg
    where chatroom_id = cwla.id
    order by msg.created_at desc
    limit 1
  ) as last_message,
  (
    select count(1)
    from public.messages
    where chatroom_id = cwla.id
    and created_at > utac.last_inside
  ) as number_new_messages,
  (
    select utg.role
    from public.user_to_group utg
    where utg.chatroom_id = cwla.id
      and utg.user_id = (select auth.uid())
    limit 1
  ) as current_user_role
from public.chatrooms_with_last_activity cwla
join public.user_to_abstract_chatroom utac on utac.chatroom_id = cwla.id and utac.user_id = (select auth.uid());

create or replace view public.group_chatroom_members
with (security_invoker)
as
select
  user_to_group.chatroom_id,
  pf.user_id,
  user_to_group.role,
  pf.description,
  pf.username,
  coalesce(pf.displayname, pf.username) as name
from public.profiles pf
join public.user_to_group on pf.user_id = user_to_group.user_id;
