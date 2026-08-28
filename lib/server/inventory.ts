import "server-only";

import { cacheLife } from "next/cache";

import { GoogleSheetsProductRepository } from "../../repositories/google-sheets-product-repository";
import { InventoryService } from "../../services/inventory-service";
import type { Product } from "../../types/product";

const productRepository = new GoogleSheetsProductRepository();
const inventoryService = new InventoryService(productRepository);

/**
 * Returns the single shared catalog snapshot used by pages, metadata and related-product
 * selectors. Google credentials are read below the repository boundary and are not arguments or
 * captured values in this cache key.
 *
 * Errors are deliberately allowed to propagate so an unavailable Google Sheet is never cached as
 * an empty catalog.
 */
export async function getCachedCatalogProducts(): Promise<readonly Product[]> {
    "use cache";

    cacheLife({
        stale: 60,
        revalidate: 5 * 60,
        expire: 60 * 60,
    });

    return inventoryService.getProducts();
}
