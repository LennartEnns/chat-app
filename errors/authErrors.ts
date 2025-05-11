const messages: { [key: string]: string } = {
    'user_already_exists': 'This user already exists',
    'validation_failed': 'Invalid inputs',
}

export function getAuthErrorMessage(code: string, fallback: string = "Unknown authentication error"): string {
    const msg = messages[code]
    return msg ?? fallback
}
