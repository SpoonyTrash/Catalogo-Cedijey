import { safeCreateProduct } from "../products/create-product";
import type { RawProductSheetRecord } from "../../types/google-sheets";
import type { Product } from "../../types/product";

export type ProductRowValidationIssue = Readonly<{
    field: string;
    message: string;
}>;

export type InvalidProductRowReport = Readonly<{
    rowNumber: number;
    sku: string | null;
    issues: readonly ProductRowValidationIssue[];
}>;

export type InvalidProductRowReporter = (report: InvalidProductRowReport) => void;

function getReportableSku(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const normalizedSku = value.trim();
    return normalizedSku.length > 0 ? normalizedSku : null;
}

function formatIssuePath(path: readonly PropertyKey[]): string {
    if (path.length === 0) {
        return "fila";
    }

    return path.map(String).join(".");
}

export function reportInvalidProductRow(report: InvalidProductRowReport): void {
    // React replays console calls made inside a `use cache` fill to the browser. On Windows,
    // repeatedly serializing these development warnings can fail while transferring the RSC
    // stream's ArrayBuffer. Writing the same structured event directly to stderr keeps it
    // server-only and avoids including it in the cached component payload.
    process.stderr.write(`[invalid-product-row] ${JSON.stringify(report)}\n`);
}

export function validateProductRows(
    records: readonly RawProductSheetRecord[],
    reporter: InvalidProductRowReporter = reportInvalidProductRow,
): readonly Product[] {
    const validProducts: Product[] = [];

    records.forEach((record, index) => {
        const result = safeCreateProduct({
            sku: record.sku,
            artist: record.artist,
            album: record.album,
            status: record.status,
            genre: record.genre,
            coverImageUrl: record.coverImage,
        });

        if (result.success) {
            validProducts.push(result.data);
            return;
        }

        reporter({
            rowNumber: index + 2,
            sku: getReportableSku(record.sku),
            issues: result.error.issues.map((issue) => ({
                field: formatIssuePath(issue.path),
                message: issue.message,
            })),
        });
    });

    return validProducts;
}
