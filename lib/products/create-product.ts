import { productSchema, type Product } from "../../schemas/product.schema";

export const DEFAULT_PRODUCT_COVER_IMAGE_URL =
    "https://res.cloudinary.com/im1hqc5v/image/upload/v1788224559/0e61cc34-e3e7-40c0-828b-4dc2e453ea59.png";

export type ProductSource = Readonly<{
    sku: unknown;
    artist: unknown;
    album: unknown;
    status: unknown;
    genre: unknown;
    coverImageUrl: unknown;
}>;

function withDefaultCoverImage(source: ProductSource): ProductSource {
    return {
        ...source,
        coverImageUrl: source.coverImageUrl ?? DEFAULT_PRODUCT_COVER_IMAGE_URL,
    };
}

/**
 * Creates the final Product object consumed by repositories, services and the frontend.
 *
 * All external data sources must be adapted to ProductSource before crossing this boundary.
 * The schema guarantees that the returned object contains only the official Product fields.
 * Products without a cover image receive the shared catalog fallback image.
 */
export function createProduct(source: ProductSource): Product {
    return productSchema.parse(withDefaultCoverImage(source));
}

/**
 * Non-throwing variant used when processing untrusted bulk data, such as Google Sheets rows.
 */
export function safeCreateProduct(source: ProductSource) {
    return productSchema.safeParse(withDefaultCoverImage(source));
}
