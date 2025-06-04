import type { AuthError } from '@supabase/auth-js';

const messages: { [key: string]: string } = {
    'user_already_exists': 'A user with this email already exists',
    'email_exists': 'This email is already taken',
    'validation_failed': 'Invalid inputs',
    'invalid_credentials': 'Invalid login credentials',
    'email_address_invalid': 'Invalid Email address',
    'email_not_confirmed': 'Confirm your Email address first',
    'same_password': 'This already is your password!',
}

export function getAuthErrorMessage(error: AuthError, fallback: string = "Unknown authentication error"): string {
    const code = error.code;
    if (!code) return fallback;
    const msg = messages[code];
    return msg ?? fallback;
}

export function logAuthError(error: AuthError, process: string) {
    console.error(`An auth error occured during ${ process }: ${ Object.keys(error) } \n ${ Object.values(error) }`);
}
