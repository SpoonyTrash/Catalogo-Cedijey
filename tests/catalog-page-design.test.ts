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
const brandSource = readFileSync(join(projectRoot, "components/site/brand.tsx"), "utf8");
const headerSource = readFileSync(join(projectRoot, "components/site/site-header.tsx"), "utf8");
const layoutSource = readFileSync(join(projectRoot, "app/layout.tsx"), "utf8");

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

test("solo los productos agotados muestran estado y reducen su opacidad", () => {
    assert.match(productCardSource, /isSoldOut/);
    assert.match(productCardSource, /isProductSoldOut\(product\.status\)/);
    assert.match(productCardSource, /opacity-45/);
    assert.match(productCardSource, /opacity-55/);
    assert.match(productCardSource, /☹/);
    assert.match(productCardSource, /AGOTADO/);
    assert.match(productCardSource, /isSoldOut \? "Agotado" : "Ver producto"/);
    assert.doesNotMatch(productCardSource, />\s*Disponible\s*</);
    assert.doesNotMatch(productCardSource, />\s*Poco stock\s*</);
    assert.match(productCardSource, /mt-3\.5/);
});

test("muestra seis géneros inicialmente y permite revelar los restantes", () => {
    assert.match(catalogBrowserSource, /genres\.slice\(0, 6\)/);
    assert.match(catalogBrowserSource, /showAllGenres/);
    assert.match(catalogBrowserSource, /setShowAllGenres\(true\)/);
    assert.match(catalogBrowserSource, /Ver todas/);
});

test("la identidad de CEDIJEY aparece en el header, footer y título de la página", () => {
    assert.match(brandSource, /CEDIJEY/);
    assert.match(brandSource, /\/cedijey-logo\.png/);
    assert.doesNotMatch(brandSource, /MiniÁlbum|Keychains/);
    assert.match(headerSource, /CEDIJEY, inicio/);
    assert.match(footerSource, /© 2026 CEDIJEY\. Todos los derechos reservados\./);
    assert.match(layoutSource, /title: ["']CEDIJEY \| Cátalogo["']/);
});

test("personalización abre el chat y el footer conserva solo Instagram", () => {
    assert.match(catalogBrowserSource, /Personalizar/);
    assert.match(catalogBrowserSource, /https:\/\/ig\.me\/m\/cedijey/g);
    assert.doesNotMatch(catalogBrowserSource, /onPersonalize|personalizar\/|wa\.me/);
    assert.match(footerSource, /Instagram/);
    assert.match(footerSource, /https:\/\/www\.instagram\.com\/cedijey\//);
    assert.doesNotMatch(footerSource, /TikTok|YouTube|SOCIAL_LABELS/);
});
