-- Triggers to create base chatroom before a corresponding subtype entry is created
create function public.before_insert_group_chatroom()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare _new_id uuid;
begin
  if exists (select 1 from public.chatrooms where id = new.chatroom_id) then
    raise exception 'Cannot insert existing chatroom';
  end if;
  select coalesce(new.chatroom_id, gen_random_uuid()) into _new_id;
  insert into public.chatrooms (id, type)
  values (_new_id, 'group');
  new.chatroom_id = _new_id;
  return new;
end;
$$;

create trigger auto_create_group_chatroom_base
  before insert on public.group_chatrooms
  for each row
  execute procedure public.before_insert_group_chatroom();


create function public.before_insert_direct_chatroom()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare _new_id uuid;
begin
  if exists (select 1 from public.chatrooms where id = new.chatroom_id)
  or exists (select 1 from public.direct_chatrooms where 
    (user2_id = new.user1_id and user1_id = new.user2_id)) -- Edge case
  then
    raise exception 'Cannot insert existing chatroom';
  end if;
  select coalesce(new.chatroom_id, gen_random_uuid()) into _new_id;
  insert into public.chatrooms (id, type)
  values (_new_id, 'direct');
  new.chatroom_id = _new_id;
  return new;
end;
$$;
revoke all on function public.before_insert_direct_chatroom() from authenticated, anon;

create trigger auto_create_direct_chatroom_base
  before insert on public.direct_chatrooms
  for each row
  execute procedure public.before_insert_direct_chatroom();


-- Triggers to delete base chatroom after the corresponding subtype entry has been deleted
create function public.after_delete_subtype_chatroom()
returns trigger
language plpgsql
security definer
set search_path = ''
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
