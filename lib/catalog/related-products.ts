import type { RelatedProducts } from "../../types/catalog";
import type { Product } from "../../types/product";
import { normalizeCatalogText } from "./normalize-catalog-text";

type ProductMatcher = (product: Product) => boolean;

function selectUniqueRelatedProducts(
    products: readonly Product[],
    currentProduct: Product,
    matches: ProductMatcher,
): readonly Product[] {
    const currentSkuKey = normalizeCatalogText(currentProduct.sku);
    const seenSkuKeys = new Set<string>([currentSkuKey]);
    const relatedProducts: Product[] = [];

    for (const product of products) {
        const skuKey = normalizeCatalogText(product.sku);

        if (!seenSkuKeys.has(skuKey) && matches(product)) {
            seenSkuKeys.add(skuKey);
            relatedProducts.push(product);
        }
    }

    return relatedProducts;
}

/**
 * Returns every other album by the current artist, preserving catalog order.
 */
export function getRelatedProductsByArtist(
    products: readonly Product[],
    currentProduct: Product,
): readonly Product[] {
    const artistKey = normalizeCatalogText(currentProduct.artist);

    return selectUniqueRelatedProducts(
        products,
        currentProduct,
        (product) => normalizeCatalogText(product.artist) === artistKey,
    );
}

/**
 * Returns every other album in the current genre, preserving catalog order.
 */
export function getRelatedProductsByGenre(
    products: readonly Product[],
    currentProduct: Product,
): readonly Product[] {
    const genreKey = normalizeCatalogText(currentProduct.genre);

    return selectUniqueRelatedProducts(
        products,
        currentProduct,
        (product) => normalizeCatalogText(product.genre) === genreKey,
    );
}

/**
 * Groups related albums with artist matches first. Genre matches already present in the artist
 * group are removed so that the UI never renders the same SKU twice.
 */
export function getRelatedProducts(
    products: readonly Product[],
    currentProduct: Product,
): RelatedProducts {
    const byArtist = getRelatedProductsByArtist(products, currentProduct);
    const artistSkuKeys = new Set(byArtist.map((product) => normalizeCatalogText(product.sku)));
    const byGenre = getRelatedProductsByGenre(products, currentProduct).filter(
        (product) => !artistSkuKeys.has(normalizeCatalogText(product.sku)),
    );

    return {
        byArtist,
        byGenre,
    };
}
