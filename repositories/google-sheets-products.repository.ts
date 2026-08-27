import "server-only";

import { GoogleSheetsConfigurationError } from "@/lib/errors/google-sheets-error";
import { getGoogleSheetsClient } from "@/lib/google/google-sheets-client";
import {
    GOOGLE_SHEETS_REQUEST_OPTIONS,
    runGoogleSheetsOperation,
} from "@/lib/google/google-sheets-request";
import { convertProductRowsToObject } from "@/lib/google/product-row-mapper";
import { validateProductRows } from "@/lib/google/product-row-validator";
import type { GoogleSheetRow } from "@/types/google-sheets";
import type { Product } from "@/types/product";

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

    return runGoogleSheetsOperation("read", async () => {
        const sheets = await getGoogleSheetsClient();

        const response = await sheets.spreadsheets.values.get(
            {
                spreadsheetId,
                range: PRODUCTS_SHEET_RANGE,
                majorDimension: "ROWS",
                valueRenderOption: "FORMATTED_VALUE",
            },
            GOOGLE_SHEETS_REQUEST_OPTIONS,
        );

        return response.data.values ?? [];
    });
}

export async function getProductsFromGoogleSheets(): Promise<readonly Product[]> {
    const rows = await getProductRowsFromGoogleSheets();
    const records = convertProductRowsToObject(rows);

    return validateProductRows(records);
}
