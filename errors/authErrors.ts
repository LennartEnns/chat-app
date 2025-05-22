import type { AuthError } from '@supabase/auth-js/dist/module/lib/errors'

const messages: { [key: string]: string } = {
    'user_already_exists': 'A user with this email already exists',
    'email_exists': 'This email is already taken',
    'validation_failed': 'Invalid inputs',
    'invalid_credentials': 'Invalid login credentials',
    'email_address_invalid': 'Invalid Email address',
    'email_not_confirmed': 'Confirm your Email address first',
}

export function getAuthErrorMessage(code: string | undefined, fallback: string = "Unknown authentication error"): string {
    if (!code) return fallback
    const msg = messages[code]
    return msg ?? fallback
}

export function logAuthError(error: AuthError, process: string) {
    console.error(`An auth error occured during ${ process }: ${ Object.keys(error) } \n ${ Object.values(error) }`)
}
