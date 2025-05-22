const usernameRegex = /^([A-Za-z][A-Za-z0-9]*[-])*[A-Za-z][A-Za-z0-9]*$/;
const displayNameRegex = /^([A-Za-z]+[\s-])*[A-Za-z]+$/;

export function validateUsername(username: string): boolean {
    return usernameRegex.test(username);
}
export const usernameFormatMessage = "Username parts must start with a letter, contain only letters/numbers and be separated by hyphens"


export function validateDisplayName(displayname: string): boolean {
    return displayNameRegex.test(displayname);
}
export const displayNameFormatMessage = "Display name parts must contain only letters and be separated by spaces or hyphens"
