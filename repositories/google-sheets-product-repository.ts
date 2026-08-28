import "server-only";

import type { ProductRepository } from "./product-repository";
import type { Product } from "../types/product";

export type GoogleSheetsProductLoader = () => Promise<readonly Product[]>;

async function loadProductsFromGoogleSheets(): Promise<readonly Product[]> {
    const { getProductsFromGoogleSheets } = await import("./google-sheets-products.repository");

    return getProductsFromGoogleSheets();
}

/**
 * Adapts the Google Sheets data source to the repository contract consumed by services.
 */
export class GoogleSheetsProductRepository implements ProductRepository {
    constructor(
        private readonly productLoader: GoogleSheetsProductLoader = loadProductsFromGoogleSheets,
    ) {}

    getAll(): Promise<readonly Product[]> {
        return this.productLoader();
    }
}
