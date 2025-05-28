import type { PostgrestError } from "@supabase/postgrest-js";

const messages: { [key: string]: string } = {
    "no_data": "No data found - query returned no results",
    "insufficient_privilege": "Insufficient privileges to access this data",
    "undefined_table": "The specified table does not exist",
    "undefined_column": "The specified column does not exist",
    "connection_exception": "General database connection error",
    "connection_failure": "Failed to connect to database",
    "too_many_connections": "Too many simultaneous database connections",
    "syntax_error": "SQL syntax error in query",
    "invalid_text_representation": "Invalid data type or format error in query",
    "numeric_value_out_of_range": "Numeric value is outside valid range",
    "query_canceled": "Query was canceled or timed out",
    "out_of_memory": "Insufficient memory available for query",
    "datatype_mismatch": "Data types do not match",
    "invalid_column_reference": "Invalid column reference in query",
    "grouping_error": "Error in GROUP BY clause",
};

export function getPostgrestErrorMessage(
    error: PostgrestError,
    fallback: string = "Unknown postgrest error",
): string {
    const code = error.code;
    if (!code) return fallback;
    const msg = messages[code];
    return msg ?? fallback;
}

export function logPostgrestError(error: PostgrestError, process: string) {
    console.error(
        `An auth error occured during ${process}: ${Object.keys(error)} \n ${
            Object.values(error)
        }`,
    );
}
