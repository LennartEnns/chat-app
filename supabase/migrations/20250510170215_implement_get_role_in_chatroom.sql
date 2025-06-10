create schema utils;
revoke all on schema utils from anon, authenticated;
revoke execute on all functions in schema utils from anon, authenticated;

create function utils.get_role_in_chatroom(uid uuid, cid uuid)
returns chatroom_role
language plpgsql
security definer set search_path = ''
stable
as $$
declare
  _cr_type public.chatroom_type;
  _role public.chatroom_role;
begin
  select type from public.chatrooms c where c.id = cid into _cr_type;
  if _cr_type is null then
    return null;
  end if;
  if _cr_type = 'group' then
    select role into _role
    from public.user_to_group utg
    where utg.user_id = uid and utg.chatroom_id = cid;

    return _role;
  else
    if not exists(
      select 1 from public.direct_chatrooms dc
      where dc.chatroom_id = cid
      and (dc.user1_id = uid or dc.user2_id = uid)
    ) then return null;
    end if;
    return 'admin'; -- Direct chatroom members are always "Admin"
  end if;
end;
$$;
