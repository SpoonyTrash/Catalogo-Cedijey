import type { Product } from "../../types/product";
import { normalizeCatalogText } from "./normalize-catalog-text";

const GENRE_COLLATOR = new Intl.Collator("es-MX", {
    sensitivity: "base",
});

/**
 * Returns the distinct genres available in the catalog using the first encountered spelling
 * as the display label. The visual "Todos" option is intentionally not added here.
 */
export function getAvailableGenres(products: readonly Product[]): readonly string[] {
    const genresByComparisonKey = new Map<string, string>();

    for (const product of products) {
        const comparisonKey = normalizeCatalogText(product.genre);

        if (comparisonKey.length > 0 && !genresByComparisonKey.has(comparisonKey)) {
            genresByComparisonKey.set(comparisonKey, product.genre);
        }
    }

    return [...genresByComparisonKey.values()].sort((left, right) =>
        GENRE_COLLATOR.compare(left, right),
    );
}

/**
 * Filters by genre without mutating or reordering the source catalog. A null genre represents
 * the visual "Todos" option and therefore returns a new array containing every product.
 */
export function filterProductsByGenre(
    products: readonly Product[],
    selectedGenre: string | null,
): readonly Product[] {
    if (selectedGenre === null) {
        return [...products];
    }

    const selectedGenreKey = normalizeCatalogText(selectedGenre);

    return products.filter((product) => normalizeCatalogText(product.genre) === selectedGenreKey);
}
