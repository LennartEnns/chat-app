create function is_user_in_chatroom(uid uuid, cid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from user_to_chatroom
    where user_id = uid and chatroom_id = cid
  )
$$;
