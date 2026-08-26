import "server-only";

import { normalizeError } from "@/lib/errors/normalize-error";
import { reportError } from "@/lib/errors/report-error";
import type { ProductRepository } from "@/repositories/product-repository";
import type { Product } from "@/types/product";

export class InventoryService {
    constructor(private readonly productRepository: ProductRepository) {}

    async getProducts(): Promise<readonly Product[]> {
        try {
            return await this.productRepository.getAll();
        } catch (error) {
            const appError = normalizeError(error, {
                code: "INVENTORY_UNAVAILABLE",
                message: "InventoryService.getProducts failed",
                userMessage: "No fue posible cargar el inventario.",
            });

            reportError(appError, {
                layer: "service",
                operation: "getProducts",
            });

            throw appError;
        }
    }

    async getProductBySku(sku: string): Promise<Product | null> {
        const normalizedSku = sku.trim().toUpperCase();

        if (normalizedSku.length === 0) {
            return null;
        }

        try {
            const products = await this.productRepository.getAll();

            return (
                products.find((product) => product.sku.trim().toUpperCase() === normalizedSku) ??
                null
            );
        } catch (error) {
            const appError = normalizeError(error, {
                code: "INVENTORY_UNAVAILABLE",
                message: "InventoryService.getProductBySku failed",
                userMessage: "No fue posible consultar el producto.",
            });

            reportError(appError, {
                layer: "service",
                operation: "getProductBySku",
                sku: normalizedSku,
            });

            throw appError;
        }
    }
}
