import "server-only";

import { AppError } from "../lib/errors/app-error";
import { reportError, type ErrorContext } from "../lib/errors/report-error";
import type { ProductRepository } from "../repositories/product-repository";
import type { Product } from "../types/product";

type InventoryServiceOptions = Readonly<{
    errorContext?: ErrorContext;
}>;

function createInventoryUnavailableError(
    error: unknown,
    message: string,
    userMessage: string,
): AppError {
    return new AppError({
        code: "INVENTORY_UNAVAILABLE",
        message,
        userMessage,
        cause: error,
    });
}

export class InventoryService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly options: InventoryServiceOptions = {},
    ) {}

    async getProducts(): Promise<readonly Product[]> {
        try {
            return await this.productRepository.getAll();
        } catch (error) {
            const appError = createInventoryUnavailableError(
                error,
                "InventoryService.getProducts failed",
                "No fue posible cargar el inventario.",
            );

            reportError(appError, {
                layer: "service",
                operation: "getProducts",
                ...this.options.errorContext,
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
            const appError = createInventoryUnavailableError(
                error,
                "InventoryService.getProductBySku failed",
                "No fue posible consultar el producto.",
            );

            reportError(appError, {
                layer: "service",
                operation: "getProductBySku",
                sku: normalizedSku,
                ...this.options.errorContext,
            });

            throw appError;
        }
    }
}
