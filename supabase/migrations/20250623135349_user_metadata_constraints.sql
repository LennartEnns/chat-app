create or replace function enforce_raw_user_meta_data()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  required_keys text[] := array['username', 'first_login'];
  optional_keys text[] := array['displayname', 'description', 'sub', 'email', 'email_verified', 'phone_verified'];
  allowed_keys text[] := required_keys || optional_keys;
  keys text[];
  key text;
  text_val text;
begin
  if TG_OP = 'UPDATE' and new.raw_user_meta_data is not distinct from old.raw_user_meta_data then
    return new;
  end if;

  if new.raw_user_meta_data is null then
    raise exception 'User metadata required';
  end if;

  -- 1. Validate keys
  keys := array(select jsonb_object_keys(new.raw_user_meta_data));

  -- Check for unknown keys (not allowed)
  foreach key in array keys loop
    if not (key = any (allowed_keys)) then
      raise exception 'user metadata contains disallowed key: %', key;
    end if;
  end loop;

  -- Check required keys are all present
  foreach key in array required_keys loop
    if not (key = any (keys)) then
      raise exception 'user metadata is missing required key: %', key;
    end if;
  end loop;

  -- 2. Field validations
  text_val := new.raw_user_meta_data->>'username';
  if jsonb_typeof(new.raw_user_meta_data->'username') != 'string' or length(text_val) > 30 or text_val !~ '^([A-Za-z][A-Za-z0-9]*[-])*[A-Za-z][A-Za-z0-9]*$' then
    raise exception 'Invalid value for username';
  end if;
  if jsonb_typeof(new.raw_user_meta_data->'first_login') != 'boolean' then
    raise exception 'first_login must be of boolean type';
  end if;


  text_val := new.raw_user_meta_data->>'displayname';
  if text_val is not null then
    if jsonb_typeof(new.raw_user_meta_data->'displayname') != 'string' or length(text_val) > 50 or text_val !~ '^([A-Za-z]+[\s-])*[A-Za-z]+$' then
      raise exception 'Invalid value for displayname';
    end if;
  end if;
  text_val := new.raw_user_meta_data->>'description';
  if text_val is not null then
    if jsonb_typeof(new.raw_user_meta_data->'description') != 'string' or length(text_val) > 255 then
      raise exception 'Invalid value for description';
    end if;
  end if;

  text_val := new.raw_user_meta_data->>'sub';
  if text_val is not null then
    if jsonb_typeof(new.raw_user_meta_data->'sub') != 'string' then
      text_val := null;
    end if;
    if text_val is null or text_val !~ '^[0-9a-f\-]{36}$' then
      raise exception 'Invalid value for sub';
    end if;
  end if;

  text_val := new.raw_user_meta_data->>'email';
  if text_val is not null then
    if jsonb_typeof(new.raw_user_meta_data->'email') != 'string' then
      text_val := null;
    end if;
    if text_val is null or length(text_val) > 254 then
      raise exception 'Invalid value for email';
    end if;
  end if;

  if jsonb_typeof(new.raw_user_meta_data->'email_verified') not in ('boolean', 'null') then
    raise exception 'email_verified must be of boolean type';
  end if;
  if jsonb_typeof(new.raw_user_meta_data->'phone_verified') not in ('boolean', 'null') then
    raise exception 'phone_verified must be of boolean type';
  end if;

  return new;
end;
$$;

create trigger validate_user_metadata
before insert or update on auth.users
for each row
execute function enforce_raw_user_meta_data();
