const URL_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;
const BARE_HOST_PATTERN = /^(?:localhost(?::\d+)?|(?:[a-z\d-]+\.)+[a-z]{2,})(?:[/:?#]|$)/i;

function addDefaultProtocol(value: string): string {
    if (value.startsWith("//")) {
        return `https:${value}`;
    }

    if (!URL_SCHEME_PATTERN.test(value) && BARE_HOST_PATTERN.test(value)) {
        return `https://${value}`;
    }

    return value;
}

/**
 * Normalizes a public image URL coming from an external data source such as Google Sheets.
 *
 * The function is intentionally provider-agnostic: it does not rewrite URLs for Cloudinary,
 * Google Drive, or any other image host. It cleans common input mistakes while preserving
 * invalid values so the validation layer can report the affected Sheet row.
 */
export function normalizeImageUrl(value: string): string | null;
export function normalizeImageUrl(value: null): null;
export function normalizeImageUrl<T>(value: T): T;
export function normalizeImageUrl(value: unknown): unknown {
    if (typeof value !== "string") {
        return value;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
        return null;
    }

    try {
        const url = new URL(addDefaultProtocol(trimmedValue));

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return trimmedValue;
        }

        return url.toString();
    } catch {
        return trimmedValue;
    }
}
