import type { PostgrestError } from "@supabase/postgrest-js";

// Empty for now because none of the codes should be shown to the user as something other than "Unknown error"
// (Except maybe for something like timeout errors)
const messages: { [key: string]: string } = {};

export function getPostgrestErrorMessage(error: PostgrestError, fallback: string = "Unknown error fetching data"): string {
    const code = error.code;
    if (!code) return fallback;
    const msg = messages[code];
    return msg ?? fallback;
}

export function logPostgrestError(error: PostgrestError, process: string) {
    console.error(
        `A postgrest error occured during ${process}: ${Object.keys(error)} \n ${
            Object.values(error)
        }`,
    );
}
