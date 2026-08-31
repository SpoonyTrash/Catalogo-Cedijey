import "server-only";

import { revalidateTag } from "next/cache";

import {
    catalogRevalidationRateLimiter,
    createCatalogRevalidationHandler,
} from "@/lib/server/catalog-revalidation";
import { CATALOG_PRODUCTS_CACHE_TAG } from "@/lib/server/inventory";

const handleCatalogRevalidation = createCatalogRevalidationHandler({
    getExpectedSecret: () => process.env.CATALOG_REVALIDATION_SECRET,
    invalidateCatalog: () => {
        revalidateTag(CATALOG_PRODUCTS_CACHE_TAG, { expire: 0 });
    },
    rateLimiter: catalogRevalidationRateLimiter,
});

export function POST(request: Request): Response {
    return handleCatalogRevalidation(request);
}
