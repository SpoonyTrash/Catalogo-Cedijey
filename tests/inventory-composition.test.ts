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
