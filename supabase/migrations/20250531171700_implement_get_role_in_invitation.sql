create function utils.get_role_in_invitation(uid uuid, cid uuid)
returns chatroom_role
language sql
security definer set search_path = ''
stable
as $$
  select as_role from public.group_invitations
  where invitee_id = uid and chatroom_id = cid
$$;
