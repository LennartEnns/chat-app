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

alter table public.messages drop constraint content_length_check;
alter table public.messages add constraint content_length_check check (length(content) <= 2048);
