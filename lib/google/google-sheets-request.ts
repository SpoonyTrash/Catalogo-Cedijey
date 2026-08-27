import {
    GoogleSheetsAuthenticationError,
    GoogleSheetsError,
    GoogleSheetsReadError,
    GoogleSheetsUnavailableError,
    type GoogleSheetsUnavailableReason,
} from "../errors/google-sheets-error";

export const GOOGLE_SHEETS_REQUEST_TIMEOUT_MS = 8_000;

export const GOOGLE_SHEETS_REQUEST_OPTIONS = {
    timeout: GOOGLE_SHEETS_REQUEST_TIMEOUT_MS,
    retry: false,
} as const;

export type GoogleSheetsOperation = "authenticate" | "read";

type UnknownRecord = Record<string, unknown>;

const TIMEOUT_ERROR_CODES = new Set(["ETIMEDOUT", "ESOCKETTIMEDOUT", "ECONNABORTED"]);
const NETWORK_ERROR_CODES = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "EAI_AGAIN",
    "ENETDOWN",
    "ENETUNREACH",
    "ENOTFOUND",
]);

function asRecord(value: unknown): UnknownRecord | null {
    return typeof value === "object" && value !== null ? (value as UnknownRecord) : null;
}

function getErrorCode(error: unknown, depth = 0): string | null {
    if (depth > 2) {
        return null;
    }

    const record = asRecord(error);

    if (!record) {
        return null;
    }

    if (typeof record.code === "string") {
        return record.code.toUpperCase();
    }

    return getErrorCode(record.cause, depth + 1);
}

function getErrorStatus(error: unknown): number | null {
    const record = asRecord(error);

    if (!record) {
        return null;
    }

    if (typeof record.status === "number") {
        return record.status;
    }

    if (typeof record.statusCode === "number") {
        return record.statusCode;
    }

    const response = asRecord(record.response);

    return response && typeof response.status === "number" ? response.status : null;
}

export function getGoogleSheetsUnavailableReason(
    error: unknown,
): GoogleSheetsUnavailableReason | null {
    const status = getErrorStatus(error);

    if (status === 408 || status === 504) {
        return "timeout";
    }

    if (status === 429) {
        return "rate_limited";
    }

    if (status !== null && status >= 500 && status <= 599) {
        return "server_error";
    }

    const code = getErrorCode(error);

    if (code && TIMEOUT_ERROR_CODES.has(code)) {
        return "timeout";
    }

    if (code && NETWORK_ERROR_CODES.has(code)) {
        return "network";
    }

    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
        return "timeout";
    }

    return null;
}

export function toGoogleSheetsError(
    error: unknown,
    operation: GoogleSheetsOperation,
): GoogleSheetsError {
    if (error instanceof GoogleSheetsError) {
        return error;
    }

    const unavailableReason = getGoogleSheetsUnavailableReason(error);

    if (unavailableReason) {
        return new GoogleSheetsUnavailableError(
            `Google Sheets no respondió durante la operación "${operation}".`,
            unavailableReason,
            error,
        );
    }

    if (operation === "authenticate") {
        return new GoogleSheetsAuthenticationError(
            "No fue posible autenticar la cuenta de servicio de Google Sheets.",
            error,
        );
    }

    return new GoogleSheetsReadError("No fue posible leer la hoja de productos.", error);
}

export async function runGoogleSheetsOperation<T>(
    operation: GoogleSheetsOperation,
    action: () => Promise<T>,
): Promise<T> {
    try {
        return await action();
    } catch (error) {
        throw toGoogleSheetsError(error, operation);
    }
}
