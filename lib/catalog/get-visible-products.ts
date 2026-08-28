import type { CatalogQuery, CatalogResult } from "../../types/catalog";
import type { Product } from "../../types/product";
import { filterProductsByGenre } from "./genre-selectors";
import { searchProducts } from "./search-products";
import { sortProducts } from "./sort-products";

/**
 * Applies the catalog query in a deterministic order: genre, ranked text search, then the
 * selected presentation order.
 */
export function getVisibleProducts(
    products: readonly Product[],
    query: CatalogQuery,
): CatalogResult {
    const productsInGenre = filterProductsByGenre(products, query.selectedGenre);
    const matchingProducts = searchProducts(productsInGenre, query.searchQuery);
    const visibleProducts = sortProducts(matchingProducts, query.sortOrder);

    return {
        products: visibleProducts,
        totalProducts: products.length,
        matchedProducts: visibleProducts.length,
    };
}
