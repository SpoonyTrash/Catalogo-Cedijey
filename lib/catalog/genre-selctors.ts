import type { Product } from "../../types/product";
import { normalizeCatalogText } from "./normalize-catalog-text";

const GENRE_COLLATOR = new Intl.Collator("es-MX", {
    sensitivity: "base",
});

export function getAvailableGenres(products: readonly Product[]): readonly string[] {
    const genresComparisonKey = new Map<string, string>();

    for (const product of products) {
        const comparisonKey = normalizeCatalogText(product.genre);

        if (comparisonKey.length > 0 && !genresComparisonKey.has(comparisonKey)) {
            genresComparisonKey.set(comparisonKey, product.genre);
        }
    }

    return [...genresComparisonKey.values()].sort((left, right) =>
        GENRE_COLLATOR.compare(left, right),
    );
}

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
