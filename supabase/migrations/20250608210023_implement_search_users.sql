create or replace function public.search_users(
  p_term text,
  p_excluded_ids uuid[] default null,
  p_exclude_group_id uuid default null,
  p_exclude_invitations_to_group uuid default null
)
returns table (
  user_id uuid,
  username text,
  displayname text
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select p.user_id, p.username, p.displayname
  from public.profiles p
  where
    -- Exclude current user
    p.user_id <> (select auth.uid())

    -- Search term match (case-insensitive)
    and (
      p.username ilike '%' || p_term || '%'
      or p.displayname ilike '%' || p_term || '%'
    )

    -- Exclude user IDs if provided
    and (
      p_excluded_ids is null
      or p.user_id not in (select unnest(p_excluded_ids))
    )

    -- Exclude users in the given group, if group ID is provided
    and (
      p_exclude_group_id is null
      or not exists (
        select 1 from public.user_to_group ug
        where ug.user_id = p.user_id
          and ug.chatroom_id = p_exclude_group_id
      )
    )

    -- Exclude users who have been invited to the given group, if an ID is provided
    and (
      p_exclude_invitations_to_group is null
      or not exists (
        select 1 from public.group_invitations inv
        where inv.invitee_id = p.user_id
          and inv.chatroom_id = p_exclude_invitations_to_group
      )
    )

  order by p.username
  limit 5;
end;
$$;
