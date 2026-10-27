/** OAuth 2.0 service-account JWT flow using Web Crypto (Cloudflare Workers + Node.js). */
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export type ServiceAccountCredentials = Readonly<{
    clientEmail: string;
    privateKey: string;
}>;

function base64UrlEncode(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeJson(value: object): string {
    return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
}

/** Accepts PEM with either real newlines or literal \n sequences from a secret binding. */
export function normalizePrivateKey(value: string): string {
    const trimmed = value.trim();
    const withoutEnvQuotes =
        trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
    return withoutEnvQuotes.replace(/\\n/g, "\n").replace(/\r/g, "").trim();
}

export async function createServiceAccountAssertion(
    credentials: ServiceAccountCredentials,
    nowSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
    const pem = normalizePrivateKey(credentials.privateKey);
    const base64Der = pem
        .replace("-----BEGIN PRIVATE KEY-----", "")
        .replace("-----END PRIVATE KEY-----", "")
        .replace(/\s/g, "");
    const binaryDer = atob(base64Der);
    const keyDer = Uint8Array.from(binaryDer, (character) => character.charCodeAt(0));
    const key = await crypto.subtle.importKey(
        "pkcs8",
        keyDer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"],
    );

    const unsignedAssertion = [
        encodeJson({ alg: "RS256", typ: "JWT" }),
        encodeJson({
            iss: credentials.clientEmail,
            scope: GOOGLE_SHEETS_READONLY_SCOPE,
            aud: GOOGLE_OAUTH_TOKEN_URL,
            iat: nowSeconds,
            exp: nowSeconds + 3600,
        }),
    ].join(".");
    const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        key,
        new TextEncoder().encode(unsignedAssertion),
    );

    return `${unsignedAssertion}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Does not persist tokens/promises across Worker requests. */
export async function requestServiceAccountAccessToken(
    credentials: ServiceAccountCredentials,
    fetcher: typeof fetch = fetch,
    timeoutMs = 8_000,
): Promise<string> {
    const assertion = await createServiceAccountAssertion(credentials);
    const response = await fetcher(GOOGLE_OAUTH_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion,
        }),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
    });

    if (!response.ok) {
        // Never include the response body: OAuth errors may contain credentials or assertions.
        throw Object.assign(new Error("Google rechazó la autenticación de la cuenta de servicio."), {
            status: response.status,
        });
    }

    const data: unknown = await response.json();
    if (
        typeof data !== "object" ||
        data === null ||
        !("access_token" in data) ||
        typeof data.access_token !== "string" ||
        !data.access_token
    ) {
        throw new Error("Google no devolvió un token de acceso válido.");
    }
    return data.access_token;
}
