create or replace function utils.truncate(t text, len int)
returns text
language plpgsql
security definer set search_path = ''
stable
as $$
begin
  return case
    when length(t) > len
    then left(t, (len - 3)) || '...'
    else t
  end;
end;
$$;