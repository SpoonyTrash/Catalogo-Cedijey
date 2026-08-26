export type GoogleSheetRow = readonly unknown[];

export interface RawProductSheetRecord {
    readonly sku: unknown;
    readonly artist: unknown;
    readonly album: unknown;
    readonly status: unknown;
    readonly coverImage: unknown;
    readonly genre: unknown;
}
