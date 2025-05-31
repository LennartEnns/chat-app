create function public.get_role_in_chatroom(uid uuid, cid uuid)
returns chatroom_role
language sql
security definer set search_path = ''
stable
as $$
  select role from public.user_to_chatroom
  where user_id = uid and chatroom_id = cid
$$;
revoke execute on function public.get_role_in_chatroom(uuid, uuid) from authenticated, anon;