import type { CatalogQuery, CatalogResult } from "../../types/catalog";
import type { Product } from "../../types/product";
import { filterProductsByGenre } from "./genre-selectors";
import { searchProducts } from "./search-products";

/**
 * Applies the catalog query in a deterministic order: genre first, then ranked text search.
 */
export function getVisibleProducts(
    products: readonly Product[],
    query: CatalogQuery,
): CatalogResult {
    const productsInGenre = filterProductsByGenre(products, query.selectedGenre);
    const visibleProducts = searchProducts(productsInGenre, query.searchQuery);

    return {
        products: visibleProducts,
        totalProducts: products.length,
        matchedProducts: visibleProducts.length,
    };
}
