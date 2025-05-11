const usernameRegex = /^[A-Za-z][A-Za-z0-9_]*$/;

export function validateUsername(username: string): boolean {
    return usernameRegex.test(username);
}
