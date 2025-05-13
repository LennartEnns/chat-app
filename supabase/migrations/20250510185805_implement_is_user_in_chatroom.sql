create function public.is_user_in_chatroom(uid uuid, cid uuid)
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1 from public.user_to_chatroom
    where user_id = uid and chatroom_id = cid
  )
$$;
