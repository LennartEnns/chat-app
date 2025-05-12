const usernameRegex = /^[A-Za-z][A-Za-z0-9-]*$/;

export function validateUsername(username: string): boolean {
    return usernameRegex.test(username);
}
export const usernameFormatMessage = "Username must start with a letter and only consist of letters, numbers and hyphens"
