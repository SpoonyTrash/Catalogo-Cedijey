import "server-only";

import { GoogleSheetsConfigurationError } from "@/lib/errors/google-sheets-error";
import { GOOGLE_SHEETS_REQUEST_TIMEOUT_MS, getSafeGoogleApiDiagnostic, runGoogleSheetsOperation } from "@/lib/google/google-sheets-request";
import { normalizePrivateKey, requestServiceAccountAccessToken } from "@/lib/google/google-service-account-auth";
import type { GoogleSheetRow } from "@/types/google-sheets";

function getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new GoogleSheetsConfigurationError(
            `Falta la variable de entorno obligatoria: ${name}.`,
        );
    }
    return value;
}

function getCredentials() {
    const clientEmail = getRequiredEnvironmentVariable("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const privateKey = normalizePrivateKey(getRequiredEnvironmentVariable("GOOGLE_PRIVATE_KEY"));

    if (!clientEmail.endsWith(".iam.gserviceaccount.com")) {
        throw new GoogleSheetsConfigurationError(
            "GOOGLE_SERVICE_ACCOUNT_EMAIL no contiene un correo válido de cuenta de servicio.",
        );
    }
    if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
        !privateKey.endsWith("-----END PRIVATE KEY-----")) {
        throw new GoogleSheetsConfigurationError(
            "GOOGLE_PRIVATE_KEY no contiene una clave privada válida.",
        );
    }
    return { clientEmail, privateKey };
}

/** Read Google Sheets via native fetch, compatible with Cloudflare Workers. */
export async function getGoogleSheetValues(
    spreadsheetId: string,
    range: string,
): Promise<readonly GoogleSheetRow[]> {
    const credentials = getCredentials();
    const token = await runGoogleSheetsOperation("authenticate", () =>
        requestServiceAccountAccessToken(credentials, fetch, GOOGLE_SHEETS_REQUEST_TIMEOUT_MS),
    );

    return runGoogleSheetsOperation("read", async () => {
        const url = new URL(
            `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
        );
        url.searchParams.set("majorDimension", "ROWS");
        url.searchParams.set("valueRenderOption", "FORMATTED_VALUE");

        const response = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(GOOGLE_SHEETS_REQUEST_TIMEOUT_MS),
            cache: "no-store",
        });
        if (!response.ok) {
            console.error("[google-sheets-read-diagnostic]", await getSafeGoogleApiDiagnostic(response));
            throw Object.assign(new Error("No fue posible leer los datos de Google Sheets."), {
                status: response.status,
            });
        }
        const data: unknown = await response.json();
        if (typeof data !== "object" || data === null || !("values" in data)) {
            return [];
        }
        if (!Array.isArray(data.values) ||
            !data.values.every((row: unknown) =>
                Array.isArray(row) && row.every((value: unknown) => typeof value === "string"))) {
            throw new Error("Google Sheets devolvió filas con un formato inesperado.");
        }
        return data.values as GoogleSheetRow[];
    });
}
