import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const compositionSource = readFileSync(join(process.cwd(), "lib/server/inventory.ts"), "utf8");

test("la composición del inventario está marcada como exclusiva del servidor", () => {
    assert.match(compositionSource, /import\s+["']server-only["']/);
});

test("la composición de producción utiliza Google Sheets y no el repository en memoria", () => {
    assert.match(compositionSource, /new GoogleSheetsProductRepository\(\)/);
    assert.match(compositionSource, /new InventoryService\(productRepository,\s*\{/);
    assert.match(compositionSource, /source:\s*["']google-sheets["']/);
    assert.match(compositionSource, /cacheTag:\s*CATALOG_PRODUCTS_CACHE_TAG/);
    assert.doesNotMatch(compositionSource, /InMemoryProductRepository/);
});

test("expone únicamente el catálogo cacheado y conserva los errores del inventario", () => {
    assert.match(compositionSource, /export\s+async\s+function\s+getCachedCatalogProducts\(\)/);
    assert.match(compositionSource, /["']use cache["'];/);
    assert.match(compositionSource, /return\s+inventoryService\.getProducts\(\)/);
    assert.doesNotMatch(compositionSource, /export\s+const\s+inventoryService/);
    assert.doesNotMatch(compositionSource, /return\s+\[\]/);
    assert.doesNotMatch(compositionSource, /lastProducts|fallbackProducts|cachedProducts\s*=/);
    assert.doesNotMatch(compositionSource, /catch[\s\S]{0,160}return\s+\[\]/);
});

test("define la política de actualización acordada", () => {
    assert.match(compositionSource, /cacheLife\(\{/);
    assert.match(compositionSource, /stale:\s*60/);
    assert.match(compositionSource, /revalidate:\s*5\s*\*\s*60/);
    assert.match(compositionSource, /expire:\s*60\s*\*\s*60/);
    assert.doesNotMatch(compositionSource, /unstable_cache/);
    assert.doesNotMatch(compositionSource, /GOOGLE_|process\.env/);
});

test("etiqueta la única caché global del catálogo", () => {
    assert.match(
        compositionSource,
        /export\s+const\s+CATALOG_PRODUCTS_CACHE_TAG\s*=\s*["']catalog-products["']/,
    );
    assert.match(compositionSource, /cacheTag\(CATALOG_PRODUCTS_CACHE_TAG\)/);
    assert.equal(compositionSource.match(/["']catalog-products["']/g)?.length, 1);
});

test("la clave global no depende del usuario, filtros ni productos individuales", () => {
    assert.match(compositionSource, /function\s+getCachedCatalogProducts\(\)/);
    assert.doesNotMatch(compositionSource, /cookies\(|headers\(|searchParams/);
    assert.doesNotMatch(compositionSource, /selectedGenre|searchQuery|sortOrder|sku/);
    assert.equal(compositionSource.match(/inventoryService\.getProducts\(\)/g)?.length, 1);
});
