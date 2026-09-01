import assert from "node:assert/strict";
import test from "node:test";

import {
    DEFAULT_PRODUCT_COVER_IMAGE_URL,
    createProduct,
    safeCreateProduct,
} from "../lib/products/create-product";

const validSource = {
    sku: "ACDC-HELL",
    artist: "AC DC",
    album: "Highway To Hell",
    status: "Poco stock",
    genre: "Rock",
    coverImageUrl: "https://example.com/covers/acdc-hell.jpg",
};

test("crea el objeto Product final utilizado por el frontend", () => {
    const product = createProduct(validSource);

    assert.deepEqual(product, {
        sku: "ACDC-HELL",
        artist: "AC DC",
        album: "Highway To Hell",
        status: "Poco stock",
        genre: "Rock",
        coverImageUrl: "https://example.com/covers/acdc-hell.jpg",
    });

    assert.deepEqual(Object.keys(product).sort(), [
        "album",
        "artist",
        "coverImageUrl",
        "genre",
        "sku",
        "status",
    ]);
});

test("usa la portada predeterminada cuando no hay portada", () => {
    const product = createProduct({
        ...validSource,
        coverImageUrl: null,
    });

    assert.equal(product.coverImageUrl, DEFAULT_PRODUCT_COVER_IMAGE_URL);
});

test("conserva la portada existente cuando sí está disponible", () => {
    const product = createProduct(validSource);

    assert.equal(product.coverImageUrl, validSource.coverImageUrl);
});

test("safeCreateProduct también aplica la portada predeterminada", () => {
    const result = safeCreateProduct({
        ...validSource,
        coverImageUrl: null,
    });

    assert.equal(result.success, true);

    if (result.success) {
        assert.equal(result.data.coverImageUrl, DEFAULT_PRODUCT_COVER_IMAGE_URL);
    }
});

test("rechaza propiedades que no forman parte del Product oficial", () => {
    const sourceWithExtraField = {
        ...validSource,
        boxes: 3,
    };

    const result = safeCreateProduct(sourceWithExtraField);

    assert.equal(result.success, false);

    if (!result.success) {
        assert.ok(result.error.issues.some((issue) => issue.code === "unrecognized_keys"));
    }
});

test("rechaza datos inválidos antes de que lleguen al frontend", () => {
    const result = safeCreateProduct({
        ...validSource,
        sku: "",
    });

    assert.equal(result.success, false);
});
