create table if not exists direct_chatrooms (
  chatroom_id uuid primary key references chatrooms(id) on delete cascade,
  user1_id uuid default auth.uid() references auth.users(id) on delete set null,
  user2_id uuid references auth.users(id) on delete set null,
  user2_accepted boolean default false,

  check (user1_id <> user2_id), -- No chat with yourself
  unique (user1_id, user2_id) -- Only 1 chatroom for the same 2 users
);


-- Direct Chatrooms RLS
alter table direct_chatrooms enable row level security;

create policy "Members can view direct chatrooms"
on direct_chatrooms for select to authenticated
using (
  (select auth.uid()) in (user1_id, user2_id)
);

create policy "Users can create direct chatrooms"
on direct_chatrooms for insert to authenticated
with check (
  user2_id is not null -- Required
);

create policy "Members can update direct chatrooms"
on direct_chatrooms for update to authenticated
using (
  (select auth.uid()) in (user1_id, user2_id)
);

-- Direct Chatroom Update policies trigger
create or replace function enforce_direct_chatrooms_update_policies()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Case 1: User 1 is updating
  if
    (select auth.uid()) = old.user1_id
    and new.user1_id in (old.user1_id, null) -- Can leave chatroom
    and new.user2_id = old.user2_id -- Must stay the same
    and new.user2_accepted = old.user2_accepted -- Must stay the same
  then
    return new;

  -- Case 2: User 2 is updating
  elsif
    (select auth.uid()) = old.user2_id
    and new.user1_id = old.user1_id -- Must stay the same
    and new.user2_id in (old.user2_id, null) -- Can leave chatroom
    and new.user2_accepted in (old.user2_accepted, true) -- Can accept
  then
    return new;
  end if;

  raise exception 'Update operation not allowed';
end;
$$;
revoke all on function enforce_direct_chatrooms_update_policies() from authenticated, anon;

create trigger trigger_enforce_direct_chatrooms_update_policies
before update on public.direct_chatrooms
for each row
execute procedure enforce_direct_chatrooms_update_policies();

create policy "User can delete chatroom if other user is gone/has not yet accepted"
on direct_chatrooms for delete to authenticated
using (
  (select auth.uid()) = user1_id and (user2_id is null or not user2_accepted)
  or
  (select auth.uid()) = user2_id and user1_id is null
);

-- Deletes a direct chatroom when it has no members anymore
create function public.auto_delete_empty_direct_chatroom()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if
    new.user1_id is null and
    new.user2_id is null
  then
    delete from public.chatrooms
    where id = old.chatroom_id;
  end if;

  return null;
end;
$$;
revoke all on function public.auto_delete_empty_direct_chatroom() from authenticated, anon;

create trigger auto_delete_empty_direct_chatroom
  after update on public.direct_chatrooms
  for each row
  execute procedure public.auto_delete_empty_direct_chatroom();

-- Allow only inserts of chatroom_id and user2_id
revoke insert
on table public.direct_chatrooms
from authenticated;

grant insert (chatroom_id, user2_id)
on table public.direct_chatrooms
to authenticated;
