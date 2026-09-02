import type { Product } from "../../types/product";
import { normalizeCatalogText } from "./normalize-catalog-text";

const GENRE_COLLATOR = new Intl.Collator("es-MX", {
    sensitivity: "base",
});

/**
 * Returns distinct genres ordered by product count from highest to lowest. Ties are resolved
 * alphabetically and the first encountered spelling remains the display label. The visual
 * "Todos" option is intentionally not added here.
 */
export function getAvailableGenres(products: readonly Product[]): readonly string[] {
    const genresByComparisonKey = new Map<
        string,
        {
            label: string;
            productCount: number;
        }
    >();

    for (const product of products) {
        const comparisonKey = normalizeCatalogText(product.genre);

        if (comparisonKey.length === 0) {
            continue;
        }

        const existingGenre = genresByComparisonKey.get(comparisonKey);

        genresByComparisonKey.set(comparisonKey, {
            label: existingGenre?.label ?? product.genre,
            productCount: (existingGenre?.productCount ?? 0) + 1,
        });
    }

    return [...genresByComparisonKey.values()]
        .sort(
            (left, right) =>
                right.productCount - left.productCount ||
                GENRE_COLLATOR.compare(left.label, right.label),
        )
        .map(({ label }) => label);
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
