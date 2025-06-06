-- Prevents all storage objects from being renamed/relocated
create or replace function prevent_storage_object_relocation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.name is distinct from old.name then
    raise exception 'Changing the file path is not allowed';
  end if;

  if new.bucket_id is distinct from old.bucket_id then
    raise exception 'Changing the bucket_id is not allowed';
  end if;

  return new;
end;
$$;
revoke all on function prevent_storage_object_relocation() from authenticated, anon;

create trigger no_bucket_or_name_change
before update on storage.objects
for each row
execute procedure prevent_storage_object_relocation();
