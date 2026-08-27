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

function getGoogleDriveFileId(url: URL): string | null {
    if (url.hostname !== "drive.google.com") {
        return null;
    }

    const filePathMatch = url.pathname.match(/^\/file\/d\/([^/]+)/);

    if (filePathMatch?.[1]) {
        return filePathMatch[1];
    }

    if (url.pathname === "/open" || url.pathname === "/uc") {
        return url.searchParams.get("id");
    }

    return null;
}

function normalizeGoogleDriveUrl(url: URL): string | null {
    const fileId = getGoogleDriveFileId(url);

    if (!fileId) {
        return null;
    }

    const normalizedUrl = new URL("https://drive.google.com/uc");
    normalizedUrl.searchParams.set("export", "view");
    normalizedUrl.searchParams.set("id", fileId);

    return normalizedUrl.toString();
}

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

        if (url.hostname === "drive.google.com") {
            return normalizeGoogleDriveUrl(url) ?? url.toString();
        }

        return url.toString();
    } catch {
        return null;
    }
}
