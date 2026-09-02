import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const catalogBrowserSource = readFileSync(
    join(projectRoot, "components/inventory/catalog-browser.tsx"),
    "utf8",
);
const productCardSource = readFileSync(
    join(projectRoot, "components/inventory/product-card.tsx"),
    "utf8",
);
const footerSource = readFileSync(join(projectRoot, "components/site/site-footer.tsx"), "utf8");

test("las categorías y sus conteos se derivan del catálogo real", () => {
    assert.match(catalogBrowserSource, /getAvailableGenres\(products\)/);
    assert.match(catalogBrowserSource, /normalizeCatalogText\(product\.genre\)/);
    assert.match(catalogBrowserSource, /getVisibleProducts\(products,/);
    assert.doesNotMatch(catalogBrowserSource, /\[\s*["']Pop["']|K-pop|Indie|Retro/);
});

test("buscar, filtrar y ordenar permanece local y no invalida la caché", () => {
    assert.match(catalogBrowserSource, /setSearchQuery/);
    assert.match(catalogBrowserSource, /setSelectedGenre/);
    assert.match(catalogBrowserSource, /setSortOrder/);
    assert.doesNotMatch(catalogBrowserSource, /fetch\(|revalidateTag|router\.refresh/);
});

test("cada tarjeta usa únicamente los datos reales en el formato solicitado", () => {
    assert.match(productCardSource, /product\.coverImageUrl/);
    assert.match(productCardSource, /product\.album/);
    assert.match(productCardSource, /product\.artist/);
    assert.match(productCardSource, /product\.genre/);
    assert.match(productCardSource, /Ver producto/);
    assert.doesNotMatch(productCardSource, /Weekend Drive|K-pop Energy|NOMBRE DEL ALBUM/);
});

test("personalización y redes son elementos visuales sin acciones externas", () => {
    assert.match(catalogBrowserSource, /Personalizar/);
    assert.doesNotMatch(catalogBrowserSource, /onPersonalize|personalizar\/|wa\.me/);
    assert.match(footerSource, /Instagram/);
    assert.match(footerSource, /TikTok/);
    assert.match(footerSource, /YouTube/);
    assert.doesNotMatch(footerSource, /https?:\/\//);
});
