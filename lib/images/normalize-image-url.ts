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
 * Google Drive, or any other image host. It only cleans common input mistakes and accepts
 * HTTP(S) URLs that browsers can request directly.
 */
export function normalizeImageUrl(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
        return null;
    }

    try {
        const url = new URL(addDefaultProtocol(trimmedValue));

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}
