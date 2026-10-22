import "server-only";

import { unstable_cache } from "next/cache";

import { GoogleSheetsProductRepository } from "../../repositories/google-sheets-product-repository";
import { InventoryService } from "../../services/inventory-service";
import type { Product } from "../../types/product";

export const CATALOG_PRODUCTS_CACHE_TAG = "catalog-products";

export const getCachedCatalogProducts = unstable_cache(
    async (): Promise<readonly Product[]> => {
        const productRepository = new GoogleSheetsProductRepository();

        const inventoryService = new InventoryService(productRepository, {
            errorContext: {
                source: "google-sheets",
                cacheTag: CATALOG_PRODUCTS_CACHE_TAG,
            },
        });

        return inventoryService.getProducts();
    },
    ["catalog-products"],
    {
        tags: [CATALOG_PRODUCTS_CACHE_TAG],
        revalidate: 5 * 60,
    },
);
