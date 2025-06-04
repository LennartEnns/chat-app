const usernameRegex = /^([A-Za-z][A-Za-z0-9]*[-])*[A-Za-z][A-Za-z0-9]*$/;
const displayNameRegex = /^([A-Za-z]+[\s-])*[A-Za-z]+$/;
// Matches substrings of valid usernames
const usernameSearchRegex = /^[0-9-]?([A-Za-z][A-Za-z0-9]*[-])*([A-Za-z][A-Za-z0-9]*)?$/;
// Matches substrings of valid display names
const displayNameSearchRegex = /^[\s-]?([A-Za-z]+[\s-])*([A-Za-z]+)?$/;

export function validateUsername(username: string): boolean {
    return usernameRegex.test(username);
}
export const usernameFormatMessage = "Username parts must start with a letter, contain only letters/numbers and be separated by hyphens"


export function validateDisplayName(displayname: string): boolean {
    return displayNameRegex.test(displayname);
}
export const displayNameFormatMessage = "Display name parts must contain only letters and be separated by spaces or hyphens"

export function validateUsernameSearch(query: string): boolean {
    return usernameSearchRegex.test(query);
}
export function validateDisplayNameSearch(query: string): boolean {
    return displayNameSearchRegex.test(query);
}
