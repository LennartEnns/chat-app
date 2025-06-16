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
-- Allow only inserts of chatroom_id and user2_id
revoke insert
on table public.direct_chatrooms
from authenticated;

grant insert (chatroom_id, user2_id)
on table public.direct_chatrooms
to authenticated;


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
    and new.chatroom_id = old.chatroom_id -- Must stay the same
  then
    return new;

  -- Case 2: User 2 is updating
  elsif
    (select auth.uid()) = old.user2_id
    and new.user1_id = old.user1_id -- Must stay the same
    and new.user2_id in (old.user2_id, null) -- Can leave chatroom
    and new.chatroom_id = old.chatroom_id -- Must stay the same
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

create policy "User can delete chatroom when other user has left"
on direct_chatrooms for delete to authenticated
using (
  (select auth.uid()) = user1_id and user2_id is null
  or
  (select auth.uid()) = user2_id and user1_id is null
);
