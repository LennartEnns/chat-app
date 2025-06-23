export const userLimits = {
    username: 30,
    displayname: 50,
    description: 255,
}

export const groupChatroomLimits = {
    name: 30,
    description: 255,
    imageSize: 300000, // Bytes
}

export const messageLimits = {
    content: 511,
    contentPreview: 30,
}

export function truncate(text: string, length: number) {
    return (text.length > length ? text.substring(0, (length - 3)) + '...' : text);
}
