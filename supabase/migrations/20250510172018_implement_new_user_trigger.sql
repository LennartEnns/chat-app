-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, username, displayname, description)
  values (new.id, 
          new.raw_user_meta_data ->> 'username',
          new.raw_user_meta_data ->> 'displayname',
          new.raw_user_meta_data ->> 'description'
  );
  return new;
end;
$$;
revoke all on function public.handle_new_user() from authenticated, anon;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
