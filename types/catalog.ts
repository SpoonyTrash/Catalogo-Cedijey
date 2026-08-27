import type { Product } from "./product";

export type CatalogQuery = Readonly<{
    selectedGenre: string | null;
    searchQuery: string;
}>;

export type RelatedProducts = Readonly<{
    byArtist: readonly Product[];
    byGenre: readonly Product[];
}>;

/**
 * Result returned by the catalog selectors.
 *
 * `products` contains the visible matches, while the counters allow the UI to distinguish
 * the complete catalog size from the current result count without duplicating source data.
 */
export type CatalogResult = Readonly<{
    products: readonly Product[];
    totalProducts: number;
    matchedProducts: number;
}>;
