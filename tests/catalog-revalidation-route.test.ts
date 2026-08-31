import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const routeSource = readFileSync(join(projectRoot, "app/api/revalidate/catalog/route.ts"), "utf8");
const environmentExample = readFileSync(join(projectRoot, ".env.example"), "utf8");

test("expone únicamente POST para revalidar el catálogo", () => {
    assert.match(routeSource, /export\s+function\s+POST\(request:\s*Request\)/);
    assert.doesNotMatch(routeSource, /export\s+(?:async\s+)?function\s+(?:GET|PUT|PATCH|DELETE)/);
});

test("utiliza el secreto del entorno y nunca lo obtiene de la URL", () => {
    assert.match(routeSource, /process\.env\.CATALOG_REVALIDATION_SECRET/);
    assert.match(environmentExample, /^CATALOG_REVALIDATION_SECRET=""$/m);
    assert.doesNotMatch(routeSource, /searchParams|nextUrl|request\.url/);
});

test("invalida la etiqueta compartida con la firma inmediata de Next.js 16", () => {
    assert.match(
        routeSource,
        /revalidateTag\(CATALOG_PRODUCTS_CACHE_TAG,\s*\{\s*expire:\s*0\s*\}\)/,
    );
    assert.equal(routeSource.match(/revalidateTag\(/g)?.length, 1);
    assert.doesNotMatch(routeSource, /revalidateTag\(CATALOG_PRODUCTS_CACHE_TAG\s*\)/);
});

test("no consulta ni devuelve el catálogo durante la invalidación", () => {
    assert.doesNotMatch(routeSource, /getCachedCatalogProducts|inventoryService\.getProducts/);
    assert.doesNotMatch(routeSource, /GoogleSheets|GOOGLE_PRIVATE_KEY|GOOGLE_SERVICE_ACCOUNT/);
});
