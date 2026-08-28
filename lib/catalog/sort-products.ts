import type { CatalogSortOrder } from "../../types/catalog";
import type { Product } from "../../types/product";

const ALBUM_COLLATOR = new Intl.Collator("es-MX", {
    numeric: true,
    sensitivity: "base",
});

type IndexedProduct = Readonly<{
    product: Product;
    originalIndex: number;
}>;

function compareProductsByAlbum(left: Product, right: Product): number {
    return (
        ALBUM_COLLATOR.compare(left.album, right.album) ||
        ALBUM_COLLATOR.compare(left.artist, right.artist) ||
        ALBUM_COLLATOR.compare(left.sku, right.sku)
    );
}

/**
 * Returns a new catalog ordered by album title. Relevance preserves the incoming order, which
 * allows ranked search results to remain ranked when no alphabetical option is selected.
 */
export function sortProducts(
    products: readonly Product[],
    sortOrder: CatalogSortOrder,
): readonly Product[] {
    if (sortOrder === "relevance") {
        return [...products];
    }

    const direction = sortOrder === "alphabetical-asc" ? 1 : -1;
    const indexedProducts: IndexedProduct[] = products.map((product, originalIndex) => ({
        product,
        originalIndex,
    }));

    indexedProducts.sort(
        (left, right) =>
            direction * compareProductsByAlbum(left.product, right.product) ||
            left.originalIndex - right.originalIndex,
    );

    return indexedProducts.map(({ product }) => product);
}
