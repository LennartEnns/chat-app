create function public.get_role_in_invitation(uid uuid, cid uuid)
returns chatroom_role
language sql
security definer set search_path = ''
stable
as $$
  select as_role from public.invitations
  where invitee_id = uid and chatroom_id = cid
$$;
revoke all on function public.get_role_in_invitation(uuid, uuid) from authenticated, anon;