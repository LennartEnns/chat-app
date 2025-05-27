import type { StorageError } from "@supabase/storage-js";

// We need this because the StorageError type from supabase.js is inaccurate
export type CustomStorageError = {
    statusCode: number,
    error: string,
    message: string,
    [name: string]: unknown,
}

const messages: { [key: string]: string } = {
    413: 'This file is too large',
}

export function getStorageErrorMessage(error: StorageError, fallback: string = "Unknown storage error"): string {
    const code = (error as unknown as CustomStorageError).statusCode;
    if (!code) return fallback;
    const msg = messages[code];
    return msg ?? fallback;
}

export function logStorageError(error: StorageError, process: string) {
    console.error(`A storage error occured during ${ process }: ${ Object.keys(error) } \n ${ Object.values(error) }`);
}
