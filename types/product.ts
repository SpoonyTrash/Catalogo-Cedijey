export const PRODUCT_AVAILABILITIES = ["Disponible", "Agotado"];

export type ProductAvailability = (typeof PRODUCT_AVAILABILITIES)[number];

export const PRODUCT_SALES_FREQUENCIES = ["best_seller", "low_demand", "never_requested"] as const;

export type ProductSalesFrequency = (typeof PRODUCT_SALES_FREQUENCIES)[number];

export type Product = Readonly<{
    sku: string;
    artist: string;
    album: string;
    genre: string;
    boxCount: number;
    discCount: number;
    sellableCount: number;
    availability: ProductAvailability;
    coverImageUrl: string | null;
    isPublished: boolean;
    salesFrequency: ProductSalesFrequency | null;
    isAssembled: boolean;
}>;
