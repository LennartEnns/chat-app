ALTER ROLE authenticator SET pgrst.openapi_mode TO 'disabled';
NOTIFY pgrst, 'reload config';
