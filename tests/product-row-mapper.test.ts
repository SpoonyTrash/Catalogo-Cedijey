import assert from "node:assert/strict";
import test from "node:test";

import { convertProductRowsToObject } from "../lib/google/product-row-mapper";
import { validateProductRows, type InvalidProductRowReport } from "../lib/google/product-row-validator";
import { DEFAULT_PRODUCT_COVER_IMAGE_URL } from "../lib/products/create-product";

test("publica BB-DTMF y BB-XSIEMPRE aunque ARTISTA tenga espacios y PORTADA esté vacía", () => {
    const rows = [
        ["SKU", "ARTISTA", "ALBUM", "CAJAS", "DISCOS", "VENDIBLE", "ESTADO", "PORTADA", "ARMADOS", "PUBLICAR", "ROTACION", "GENERO"],
        ["BB-DTMF", "Bad Bunny ", "Debí Tirar Más Fotos", "3", "7", "3", "🟢 Disponible", "", "TRUE", "SI", "Best Seller", "Reggaeton"],
        ["BB-XSIEMPRE", "Bad Bunny ", "X Siempre", "4", "4", "4", "🟢 Disponible", "", "TRUE", "SI", "Venta Regular", "Reggaeton"],
    ];
    const reports: InvalidProductRowReport[] = [];
    const products = validateProductRows(convertProductRowsToObject(rows), (report) => reports.push(report));

    assert.deepEqual(products.map((product) => product.sku), ["BB-DTMF", "BB-XSIEMPRE"]);
    assert.deepEqual(products.map((product) => product.artist), ["Bad Bunny", "Bad Bunny"]);
    assert.deepEqual(products.map((product) => product.coverImageUrl), [DEFAULT_PRODUCT_COVER_IMAGE_URL, DEFAULT_PRODUCT_COVER_IMAGE_URL]);
    assert.deepEqual(reports, []);
});

test("conserva la validación estricta de campos realmente inválidos", () => {
    const rows = [
        ["SKU", "ARTISTA", "ALBUM", "ESTADO", "PORTADA", "GENERO"],
        ["TEST-1", "  Bad Bunny  ", "Prueba", "Disponible", "", "   "],
    ];
    const reports: InvalidProductRowReport[] = [];
    const products = validateProductRows(convertProductRowsToObject(rows), (report) => reports.push(report));

    assert.deepEqual(products, []);
    assert.equal(reports.length, 1);
    assert.ok(reports[0]?.issues.some((issue) => issue.field === "genre"));
});
