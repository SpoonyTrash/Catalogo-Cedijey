import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const homePageSource = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");

test("the home page obtains products from the shared cached catalog", () => {
    assert.match(homePageSource, /import\s+\{\s*connection\s*\}\s+from\s+["']next\/server["']/);
    assert.match(
        homePageSource,
        /import\s+\{\s*getCachedCatalogProducts\s*\}\s+from\s+["']@\/lib\/server\/inventory["']/,
    );
    assert.match(
        homePageSource,
        /await\s+connection\(\)[\s\S]*await\s+getCachedCatalogProducts\(\)/,
    );
    assert.match(homePageSource, /<Suspense\s+fallback=\{<CatalogProductsFallback\s*\/>\}>/);
});

test("the production home page does not contain demo products or construct dependencies", () => {
    assert.doesNotMatch(homePageSource, /previewProducts/);
    assert.doesNotMatch(homePageSource, /InMemoryProductRepository/);
    assert.doesNotMatch(homePageSource, /new\s+InventoryService/);
    assert.doesNotMatch(homePageSource, /inventoryService\.getProducts/);
    assert.doesNotMatch(homePageSource, /@\/repositories\//);
    assert.doesNotMatch(homePageSource, /5SOS-STAR|ACDC-HELL|AF-2M/);
});

test("the home page composes the branded hero, interactive catalog and footer", () => {
    assert.match(homePageSource, /<SiteHeader\s*\/>/);
    assert.match(homePageSource, /<CatalogBrowser\s+products=\{products\}\s*\/>/);
    assert.match(homePageSource, /<SiteFooter\s*\/>/);
    assert.match(homePageSource, /Catálogo de[\s\S]*Llaveros Álbum/);
    assert.match(homePageSource, /a8552df4-8580-4451-9432-c042c6e41b8c\.png/);
});
