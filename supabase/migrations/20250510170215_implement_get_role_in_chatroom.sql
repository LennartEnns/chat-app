create function public.get_role_in_chatroom(uid uuid, cid uuid)
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
  if _cr_type = 'group' then
    select role into _role
    from public.user_to_group
    where user_id = uid and chatroom_id = cid;

    return _role;
  else
    return 'admin'; -- Direct chatroom members are always "Admin"
  end if;
end;
$$;
revoke all on function public.get_role_in_chatroom(uuid, uuid) from authenticated, anon;