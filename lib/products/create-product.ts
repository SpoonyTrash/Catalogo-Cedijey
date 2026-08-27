import { productSchema, type Product } from "../../schemas/product.schema";

export type ProductSource = Readonly<{
    sku: unknown;
    artist: unknown;
    album: unknown;
    status: unknown;
    genre: unknown;
    coverImageUrl: unknown;
}>;

/**
 * Creates the final Product object consumed by repositories, services and the frontend.
 *
 * All external data sources must be adapted to ProductSource before crossing this boundary.
 * The schema guarantees that the returned object contains only the official Product fields.
 */
export function createProduct(source: ProductSource): Product {
    return productSchema.parse(source);
}

/**
 * Non-throwing variant used when processing untrusted bulk data, such as Google Sheets rows.
 */
export function safeCreateProduct(source: ProductSource) {
    return productSchema.safeParse(source);
}
