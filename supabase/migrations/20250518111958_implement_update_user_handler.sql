-- Updates public.profiles
create function public.handle_user_metadata_update()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.profiles
  set
    username = coalesce(new.raw_user_meta_data ->> 'username', username),
    displayname = coalesce(new.raw_user_meta_data ->> 'displayname', displayname),
    description = coalesce(new.raw_user_meta_data ->> 'description', description)
  where user_id = new.id;

  return new;
end;
$$;

-- trigger the function every time a user is updated with new new metadata
create trigger on_auth_user_updated
  after update on auth.users
  for each row 
  when (new.raw_user_meta_data is distinct from old.raw_user_meta_data)
  execute procedure public.handle_user_metadata_update();
