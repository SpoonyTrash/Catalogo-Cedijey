import type { CatalogSortOrder } from "../../types/catalog";
import type { Product } from "../../types/product";
import { isProductSoldOut } from "../products/is-product-sold-out";

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

function moveSoldOutProductsToEnd(products: readonly Product[]): readonly Product[] {
    const availableProducts: Product[] = [];
    const soldOutProducts: Product[] = [];

    for (const product of products) {
        if (isProductSoldOut(product.status)) {
            soldOutProducts.push(product);
        } else {
            availableProducts.push(product);
        }
    }

    return [...availableProducts, ...soldOutProducts];
}

/**
 * Returns a new catalog in the requested presentation order and always places sold-out products
 * after available products. Each availability group preserves relevance or alphabetical order.
 */
export function sortProducts(
    products: readonly Product[],
    sortOrder: CatalogSortOrder,
): readonly Product[] {
    if (sortOrder === "relevance") {
        return moveSoldOutProductsToEnd(products);
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

    return moveSoldOutProductsToEnd(indexedProducts.map(({ product }) => product));
}
