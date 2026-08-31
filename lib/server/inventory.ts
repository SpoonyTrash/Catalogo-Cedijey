import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { GoogleSheetsProductRepository } from "../../repositories/google-sheets-product-repository";
import { InventoryService } from "../../services/inventory-service";
import type { Product } from "../../types/product";

export const CATALOG_PRODUCTS_CACHE_TAG = "catalog-products";

const productRepository = new GoogleSheetsProductRepository();
const inventoryService = new InventoryService(productRepository, {
    errorContext: {
        source: "google-sheets",
        cacheTag: CATALOG_PRODUCTS_CACHE_TAG,
    },
});

/**
 * Returns the single shared catalog snapshot used by pages, metadata and related-product
 * selectors. Google credentials are read below the repository boundary and are not arguments or
 * captured values in this cache key.
 *
 * With no function arguments, every consumer shares the same cache entry. Next.js coordinates
 * concurrent fills and time-based revalidation for that key.
 *
 * Errors are deliberately allowed to propagate. Next.js keeps the last successful entry when a
 * background revalidation fails, retries on a later request and surfaces the controlled error
 * when no usable entry exists. A Google failure is therefore never cached as an empty catalog.
 */
export async function getCachedCatalogProducts(): Promise<readonly Product[]> {
    "use cache";

    cacheLife({
        stale: 60,
        revalidate: 5 * 60,
        expire: 60 * 60,
    });
    cacheTag(CATALOG_PRODUCTS_CACHE_TAG);

    return inventoryService.getProducts();
}
