import { GoogleSheetsMappingError } from "@/lib/errors/google-sheets-error";
import type { GoogleSheetRow, RawProductSheetRecord } from "@/types/google-sheets";

const REQUIRED_HEADERS = ["SKU", "ARTISTA", "ALBUM", "ESTADO", "PORTADA", "GENERO"] as const;

type RequiredHeader = (typeof REQUIRED_HEADERS)[number];

function normalizeHeader(value: unknown): string {
    return String(value ?? "")
        .trim()
        .toUpperCase();
}

function createHeaderIndex(headerRow: GoogleSheetRow): Map<RequiredHeader, number> {
    const normalizedHeaders = headerRow.map(normalizeHeader);
    const headerIndex = new Map<RequiredHeader, number>();

    for (const requiredHeader of REQUIRED_HEADERS) {
        const matchingIndexes = normalizedHeaders
            .map((header, index) => ({
                header,
                index,
            }))
            .filter(({ header }) => header === requiredHeader)
            .map(({ index }) => index);

        if (matchingIndexes.length === 0) {
            throw new GoogleSheetsMappingError(
                `Falta la columna obligatoria "${requiredHeader}" en la hoja de CATÁLOGO`,
            );
        }

        if (matchingIndexes.length > 1) {
            throw new GoogleSheetsMappingError(
                `La columna "${requiredHeader}" está duplicada en la hoja CATÁLOGO`,
            );
        }

        headerIndex.set(requiredHeader, matchingIndexes[0]);
    }

    return headerIndex;
}

function getCell(
    row: GoogleSheetRow,
    headerIndex: Map<RequiredHeader, number>,
    header: RequiredHeader,
): unknown {
    const columnIndex = headerIndex.get(header);

    if (columnIndex === undefined) {
        throw new GoogleSheetsMappingError(`No fue posible localizar la columna "${header}".`);
    }

    return row[columnIndex] ?? "";
}

export function convertProductRowsToObject(
    rows: readonly GoogleSheetRow[],
): RawProductSheetRecord[] {
    if (rows.length === 0) {
        throw new GoogleSheetsMappingError("La hoja CATÁLOGO no contiene una fila de encabezados.");
    }

    const [headerRow, ...productRows] = rows;
    const headerIndex = createHeaderIndex(headerRow);

    return productRows.map((row) => ({
        sku: getCell(row, headerIndex, "SKU"),
        artist: getCell(row, headerIndex, "ARTISTA"),
        album: getCell(row, headerIndex, "ALBUM"),
        status: getCell(row, headerIndex, "ESTADO"),
        coverImage: getCell(row, headerIndex, "PORTADA"),
        genre: getCell(row, headerIndex, "GENERO"),
    }));
}
