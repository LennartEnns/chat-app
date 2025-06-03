create function public.get_filename_as_uuid(filename_with_extension text)
returns uuid
language plpgsql
security definer set search_path = ''
stable
as $$
declare _file_array text[];
begin
  select string_to_array(filename_with_extension, '.') into _file_array;
  return _file_array[1]::uuid;
exception when others then
  return null;
end;
$$;
revoke all on function public.get_filename_as_uuid(text) from authenticated, anon;