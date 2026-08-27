import type { Product } from "../../types/product";
import { normalizeCatalogText } from "./normalize-catalog-text";

type RankedProduct = Readonly<{
    product: Product;
    rank: number;
    originalIndex: number;
}>;

function getSearchRank(product: Product, searchKey: string): number | null {
    const albumKey = normalizeCatalogText(product.album);
    const artistKey = normalizeCatalogText(product.artist);

    if (albumKey === searchKey) {
        return 0;
    }

    if (albumKey.startsWith(searchKey)) {
        return 1;
    }

    if (albumKey.includes(searchKey)) {
        return 2;
    }

    if (artistKey === searchKey) {
        return 3;
    }

    if (artistKey.startsWith(searchKey)) {
        return 4;
    }

    if (artistKey.includes(searchKey)) {
        return 5;
    }

    return null;
}

/**
 * Searches albums and artists with normalized, partial matching. Album matches have priority
 * over artist matches and equal-ranked results preserve their original catalog order.
 */
export function searchProducts(
    products: readonly Product[],
    searchQuery: string,
): readonly Product[] {
    const searchKey = normalizeCatalogText(searchQuery);

    if (searchKey.length === 0) {
        return [...products];
    }

    const rankedProducts: RankedProduct[] = [];

    products.forEach((product, originalIndex) => {
        const rank = getSearchRank(product, searchKey);

        if (rank !== null) {
            rankedProducts.push({ product, rank, originalIndex });
        }
    });

    rankedProducts.sort(
        (left, right) => left.rank - right.rank || left.originalIndex - right.originalIndex,
    );

    const seenSkuKeys = new Set<string>();
    const matches: Product[] = [];

    for (const { product } of rankedProducts) {
        const skuKey = normalizeCatalogText(product.sku);

        if (!seenSkuKeys.has(skuKey)) {
            seenSkuKeys.add(skuKey);
            matches.push(product);
        }
    }

    return matches;
}
