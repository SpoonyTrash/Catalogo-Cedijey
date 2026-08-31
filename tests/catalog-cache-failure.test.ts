import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { AppError } from "../lib/errors/app-error";
import { GoogleSheetsUnavailableError } from "../lib/errors/google-sheets-error";
import { InventoryService } from "../services/inventory-service";
import type { ProductRepository } from "../repositories/product-repository";
import type { Product } from "../types/product";

const projectRoot = process.cwd();
const cacheSource = readFileSync(join(projectRoot, "lib/server/inventory.ts"), "utf8");
const routeErrorSource = readFileSync(join(projectRoot, "app/error.tsx"), "utf8");
const errorStateSource = readFileSync(join(projectRoot, "components/ui/error-state.tsx"), "utf8");

const products: readonly Product[] = [
    {
        sku: "AF-2M",
        artist: "Alejandro Fernández",
        album: "Dos Mundos",
        status: "Disponible",
        genre: "Regional mexicano",
        coverImageUrl: null,
    },
];

function createService(productRepository: ProductRepository): InventoryService {
    return new InventoryService(productRepository, {
        errorContext: {
            source: "google-sheets",
            cacheTag: "catalog-products",
        },
    });
}

async function captureConsoleErrors<T>(operation: () => Promise<T>) {
    const originalConsoleError = console.error;
    const calls: unknown[][] = [];

    console.error = (...arguments_: unknown[]) => {
        calls.push(arguments_);
    };

    try {
        return {
            result: await operation(),
            calls,
        };
    } finally {
        console.error = originalConsoleError;
    }
}

test("una primera lectura fallida lanza INVENTORY_UNAVAILABLE y nunca devuelve []", async () => {
    const sourceError = new GoogleSheetsUnavailableError("Google Sheets unavailable", "network");
    const service = createService({
        getAll: () => Promise.reject(sourceError),
    });

    const { result: thrownError, calls } = await captureConsoleErrors(async () => {
        try {
            await service.getProducts();
            assert.fail("getProducts debía lanzar un error controlado");
        } catch (error) {
            return error;
        }
    });

    assert.ok(thrownError instanceof AppError);
    assert.equal(thrownError.code, "INVENTORY_UNAVAILABLE");
    assert.equal(thrownError.userMessage, "No fue posible cargar el inventario.");
    assert.equal(thrownError.cause, sourceError);
    assert.equal(calls.length, 1);
});

test("una lectura válida devuelve los productos y no registra errores", async () => {
    const service = createService({
        getAll: () => Promise.resolve(products),
    });

    const { result, calls } = await captureConsoleErrors(() => service.getProducts());

    assert.equal(result, products);
    assert.deepEqual(calls, []);
});

test("el registro de una actualización fallida es estructurado y no expone credenciales", async () => {
    const sensitiveValues = [
        "Bearer very-secret-token",
        "service-account@example.com",
        "-----BEGIN PRIVATE KEY-----private-material-----END PRIVATE KEY-----",
    ];
    const service = createService({
        getAll: () => Promise.reject(new Error(sensitiveValues.join(" "))),
    });

    const { calls } = await captureConsoleErrors(async () => {
        await assert.rejects(() => service.getProducts(), AppError);
    });
    const serializedLog = JSON.stringify(calls);

    assert.equal(calls.length, 1);
    assert.match(serializedLog, /INVENTORY_UNAVAILABLE/);
    assert.match(serializedLog, /getProducts/);
    assert.match(serializedLog, /google-sheets/);
    assert.match(serializedLog, /catalog-products/);

    for (const sensitiveValue of sensitiveValues) {
        assert.doesNotMatch(
            serializedLog,
            new RegExp(sensitiveValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
    }
});

test("la caché conserva errores, una única entrada global y la política 60/300/3600", () => {
    const cachedFunctionStart = cacheSource.indexOf(
        "export async function getCachedCatalogProducts",
    );
    const moduleScopeSource = cacheSource.slice(0, cachedFunctionStart);
    const cachedFunctionSource = cacheSource.slice(cachedFunctionStart);

    assert.ok(cachedFunctionStart >= 0);
    assert.match(cacheSource, /["']use cache["'];/);
    assert.match(cacheSource, /cacheTag\(CATALOG_PRODUCTS_CACHE_TAG\)/);
    assert.match(cacheSource, /return\s+inventoryService\.getProducts\(\)/);
    assert.match(cacheSource, /stale:\s*60/);
    assert.match(cacheSource, /revalidate:\s*5\s*\*\s*60/);
    assert.match(cacheSource, /expire:\s*60\s*\*\s*60/);
    assert.equal(cacheSource.match(/inventoryService\.getProducts\(\)/g)?.length, 1);
    assert.doesNotMatch(cacheSource, /return\s+\[\]/);
    assert.doesNotMatch(cacheSource, /lastProducts|fallbackProducts|previewProducts/);
    assert.doesNotMatch(cacheSource, /catch[\s\S]{0,160}return\s+\[\]/);
    assert.doesNotMatch(
        moduleScopeSource,
        /new GoogleSheetsProductRepository|new InventoryService/,
    );
    assert.match(cachedFunctionSource, /new GoogleSheetsProductRepository\(\)/);
    assert.match(cachedFunctionSource, /new InventoryService\(productRepository,\s*\{/);
});

test("la interfaz oculta el error técnico y permite reintentar de forma accesible", () => {
    assert.match(routeErrorSource, /^["']use client["'];/);
    assert.match(routeErrorSource, /title=["']No pudimos cargar el inventario["']/);
    assert.match(
        routeErrorSource,
        /message=["']El servicio de inventario no está disponible temporalmente\. Intenta nuevamente\.["']/,
    );
    assert.match(routeErrorSource, /reference=\{error\.digest\}/);
    assert.match(routeErrorSource, /onRetry=\{retry\}/);
    assert.doesNotMatch(routeErrorSource, /error\.message|error\.stack|error\.cause/);

    assert.match(errorStateSource, /role=["']alert["']/);
    assert.match(errorStateSource, /aria-live=["']assertive["']/);
    assert.match(errorStateSource, /onClick=\{onRetry\}/);
    assert.match(errorStateSource, />\s*Reintentar\s*</);
});
