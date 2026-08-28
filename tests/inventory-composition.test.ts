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
    assert.match(compositionSource, /new InventoryService\(productRepository\)/);
    assert.doesNotMatch(compositionSource, /InMemoryProductRepository/);
});

test("expone únicamente el catálogo cacheado y conserva los errores del inventario", () => {
    assert.match(compositionSource, /export\s+async\s+function\s+getCachedCatalogProducts\(\)/);
    assert.match(compositionSource, /["']use cache["'];/);
    assert.match(compositionSource, /return\s+inventoryService\.getProducts\(\)/);
    assert.doesNotMatch(compositionSource, /export\s+const\s+inventoryService/);
    assert.doesNotMatch(compositionSource, /return\s+\[\]/);
});

test("define la política de actualización acordada", () => {
    assert.match(compositionSource, /cacheLife\(\{/);
    assert.match(compositionSource, /stale:\s*60/);
    assert.match(compositionSource, /revalidate:\s*5\s*\*\s*60/);
    assert.match(compositionSource, /expire:\s*60\s*\*\s*60/);
    assert.doesNotMatch(compositionSource, /unstable_cache/);
    assert.doesNotMatch(compositionSource, /GOOGLE_|process\.env/);
});
