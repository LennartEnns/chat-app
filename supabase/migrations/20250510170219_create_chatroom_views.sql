-- View and triggers for group chatrooms
create view public.group_chatrooms_view as
select
  g.chatroom_id as id, g.name, g.description
from public.group_chatrooms g;

-- Group Chatroom Insert
-- Insert the base type chatroom first, then the subtype entry
create function public.handle_insert_group_chatroom()
returns trigger
language plpgsql
security invoker -- Execute with user rights to not bypass RLS etc.
set search_path = ''
as $$
begin
  insert into public.chatrooms (id, type) values (new.id, 'group');
  insert into public.group_chatrooms (chatroom_id, name, description)
  values (new.id, new.name, new.description);
  return new;
end;
$$;
revoke all on function public.handle_insert_group_chatroom() from authenticated, anon;

create trigger trigger_insert_group_chatroom
  instead of insert on public.group_chatrooms_view
  for each row
  execute procedure public.handle_insert_group_chatroom();

-- Group Chatroom Update
create function public.handle_update_group_chatroom()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.group_chatrooms
  set
    name = new.name,
    description = new.description
  where chatroom_id = old.chatroom_id;
  return new;
end;
$$;
revoke all on function public.handle_update_group_chatroom() from authenticated, anon;

create trigger trigger_update_group_chatroom
  instead of update on public.group_chatrooms_view
  for each row
  execute procedure public.handle_update_group_chatroom();

-- Group Chatroom Delete
create function public.handle_delete_group_chatroom()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.group_chatrooms
    where chatroom_id = old.id;
  return new;
end;
$$;
revoke all on function public.handle_delete_group_chatroom() from authenticated, anon;

create trigger trigger_delete_group_chatroom
  instead of delete on public.group_chatrooms_view
  for each row
  execute procedure public.handle_delete_group_chatroom();

-------------------------------------------------------------

-- View and triggers for direct chatrooms
create view public.direct_chatrooms_view as
select
  d.chatroom_id as id, d.user1_id, d.user2_id, d.user2_accepted
from public.direct_chatrooms d;

-- Direct Chatroom Insert
-- Insert the base type chatroom first, then the subtype entry
create function public.handle_insert_direct_chatroom()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.chatrooms (id, type) values (new.id, 'direct');
  insert into public.direct_chatrooms (chatroom_id, user2_id)
  values (new.id, new.user2_id);
  return new;
end;
$$;
revoke all on function public.handle_insert_direct_chatroom() from authenticated, anon;

create trigger trigger_insert_direct_chatroom
  instead of insert on public.direct_chatrooms_view
  for each row
  execute procedure public.handle_insert_direct_chatroom();

-- Direct Chatroom Update
create function public.handle_update_direct_chatroom()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.direct_chatrooms
    set
      user1_id = new.user1_id,
      user2_id = new.user2_id,
      user2_accepted = new.user2_accepted
    where chatroom_id = old.chatroom_id;
  return new;
end;
$$;
revoke all on function public.handle_update_direct_chatroom() from authenticated, anon;

create trigger trigger_update_direct_chatroom
  instead of update on public.direct_chatrooms_view
  for each row
  execute procedure public.handle_update_direct_chatroom();

-- Direct Chatroom Delete
create function public.handle_delete_direct_chatroom()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.direct_chatrooms
    where chatroom_id = old.id;
  return new;
end;
$$;
revoke all on function public.handle_delete_direct_chatroom() from authenticated, anon;

create trigger trigger_delete_direct_chatroom
  instead of delete on public.direct_chatrooms_view
  for each row
  execute procedure public.handle_delete_direct_chatroom();


-- Triggers to auto-delete base chatroom when the corresponding subtype entry is deleted
create function public.after_delete_subtype_chatroom()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    delete from public.chatrooms
    where id = old.chatroom_id;
  return null;
end;
$$;
revoke all on function public.after_delete_subtype_chatroom() from authenticated, anon;

create trigger auto_delete_group_chatroom_base
  after delete on public.group_chatrooms
  for each row
  execute procedure public.after_delete_subtype_chatroom();

create trigger auto_delete_direct_chatroom_base
  after delete on public.direct_chatrooms
  for each row
  execute procedure public.after_delete_subtype_chatroom();


-- Allow operations through views
grant select, insert, update, delete on public.group_chatrooms_view to authenticated;
grant select, insert, update, delete on public.direct_chatrooms_view to authenticated;
