import "server-only";

import { google, type sheets_v4 } from "googleapis";

import {
    GoogleSheetsAuthenticationError,
    GoogleSheetsConfigurationError,
} from "@/lib/errors/google-sheets-error";

const GOOGLE_SHEETS_READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

let googleSheetsClientPromise: Promise<sheets_v4.Sheets> | null = null;

function getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new GoogleSheetsConfigurationError(
            `Falta la variable de entornno obligatoria: ${name}.`,
        );
    }

    return value;
}

function getServiceAccountCredentials() {
    const clientEmail = getRequiredEnvironmentVariable("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const privateKey = getRequiredEnvironmentVariable("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

    if (!clientEmail.endsWith(".iam.gserviceaccount.com")) {
        throw new GoogleSheetsConfigurationError(
            "GOOGLE_SERVICE_ACCOUNT_EMAIL no contiene un correo válido de cuenta de servicio.",
        );
    }

    if (
        !privateKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
        !privateKey.includes("-----END PRIVATE KEY-----")
    ) {
        throw new GoogleSheetsConfigurationError(
            "GOOGLE_PRIVATE_KEY no contiene una clave privada válida.",
        );
    }

    return {
        client_email: clientEmail,
        private_key: privateKey,
    };
}

async function createGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
    const credentials = getServiceAccountCredentials();

    try {
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [GOOGLE_SHEETS_READONLY_SCOPE],
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        if (!accessToken.token) {
            throw new Error("Google no devolvió un token de acceso.");
        }

        return google.sheets({
            version: "v4",
            auth,
        });
    } catch (error) {
        throw new GoogleSheetsAuthenticationError(
            "No fue posible autenticar la cuenta de servicio de Google Sheets.",
            error,
        );
    }
}

export function getGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
    if (!googleSheetsClientPromise) {
        googleSheetsClientPromise = createGoogleSheetsClient().catch((error) => {
            googleSheetsClientPromise = null;
            throw error;
        });
    }

    return googleSheetsClientPromise;
}
