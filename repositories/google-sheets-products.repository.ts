import "server-only";

import {
    GoogleSheetsConfigurationError,
    GoogleSheetsError,
    GoogleSheetsReadError,
} from "@/lib/errors/google-sheets-error";
import { getGoogleSheetsClient } from "@/lib/google/google-sheets-client";
import { convertProductRowsToObject } from "@/lib/google/product-row-mapper";
import type { GoogleSheetRow, RawProductSheetRecord } from "@/types/google-sheets";

const PRODUCTS_SHEET_RANGE = "CATÁLOGO!A:L";

function getSpreadsheetId(): string {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim();

    if (!spreadsheetId) {
        throw new GoogleSheetsConfigurationError(
            "Falta la variable de entorno obligatoria: GOOGLE_SHEET_ID.",
        );
    }

    return spreadsheetId;
}

async function getProductRowsFromGoogleSheets(): Promise<readonly GoogleSheetRow[]> {
    const spreadsheetId = getSpreadsheetId();

    try {
        const sheets = await getGoogleSheetsClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: PRODUCTS_SHEET_RANGE,
            majorDimension: "ROWS",
            valueRenderOption: "FORMATTED_VALUE",
        });

        return response.data.values ?? [];
    } catch (error) {
        if (error instanceof GoogleSheetsError) {
            throw error;
        }

        throw new GoogleSheetsReadError(
            `No fue posible leer el rango ${PRODUCTS_SHEET_RANGE}.`,
            error,
        );
    }
}

export async function getProductsFromGoogleSheets(): Promise<readonly RawProductSheetRecord[]> {
    const rows = await getProductRowsFromGoogleSheets();

    return convertProductRowsToObject(rows);
}
