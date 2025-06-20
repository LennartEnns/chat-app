-- These triggers ensure consistency between group/direct chatrooms associations to users and abstract chatroom associations to users.
-- Also handles auto-deletion of invitations and abandoned chatrooms.

---------------------- AFTER INSERT triggers -----------------------
create function after_insert_user_to_group()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Delete the invitation for the user to the chatroom, if any
  delete from public.group_invitations gi
  where
    gi.invitee_id = new.user_id
    and gi.chatroom_id = new.chatroom_id;
  
  -- Create association to abstract chatroom
  insert into public.user_to_abstract_chatroom (user_id, chatroom_id)
  values (new.user_id, new.chatroom_id);
  return new;
end;
$$;
revoke all on function after_insert_user_to_group() from authenticated, anon;

create trigger after_insert_user_to_group
  after insert on public.user_to_group
  for each row execute procedure after_insert_user_to_group();


create function after_insert_direct_chatrooms()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Create association to abstract chatroom for user 1 and user 2
  insert into public.user_to_abstract_chatroom (user_id, chatroom_id)
  values (new.user1_id, new.chatroom_id);
  insert into public.user_to_abstract_chatroom (user_id, chatroom_id)
  values (new.user2_id, new.chatroom_id);
  return new;
end;
$$;
revoke all on function after_insert_direct_chatrooms() from authenticated, anon;

create trigger after_insert_direct_chatrooms
  after insert on public.direct_chatrooms
  for each row execute procedure after_insert_direct_chatrooms();

---------------------- AFTER DELETE triggers -----------------------
create function after_delete_user_to_group()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Delete a chatroom when it has no members anymore
  if not exists (
    select 1 from public.user_to_group
    where chatroom_id = old.chatroom_id
  ) then
    delete from public.chatrooms
    where id = old.chatroom_id;
  -- Else delete the abstract chatroom association of the user who left
  else
    delete from public.user_to_abstract_chatroom
    where user_id = old.user_id
    and chatroom_id = old.chatroom_id;
  end if;

  return null;
end;
$$;
revoke all on function after_delete_user_to_group() from authenticated, anon;

create trigger after_delete_user_to_group
  after delete on public.user_to_group
  for each row
  execute procedure after_delete_user_to_group();

---------------------- AFTER UPDATE triggers -----------------------
create function after_update_direct_chatrooms()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare user_who_left uuid;
begin
  -- Delete a chatroom when it has no members anymore
  if
    new.user1_id is null and
    new.user2_id is null
  then
    delete from public.chatrooms
    where id = old.chatroom_id;
  -- Else delete the abstract chatroom association of the user who left
  elsif new.user1_id is null or new.user2_id is null then
    select (
      case when (old.user1_id is not null and new.user1_id is null)
      then old.user1_id
      else old.user2_id end
    ) into user_who_left;
    delete from public.user_to_abstract_chatroom
    where user_id = user_who_left
    and chatroom_id = old.chatroom_id;
  end if;

  return null;
end;
$$;
revoke all on function after_update_direct_chatrooms() from authenticated, anon;

create trigger after_update_direct_chatrooms
  after update on public.direct_chatrooms
  for each row
  execute procedure after_update_direct_chatrooms();
