import assert from "node:assert/strict";
import test from "node:test";

import { createProduct, safeCreateProduct } from "../lib/products/create-product";

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

test("acepta una portada nula en el objeto Product final", () => {
    const product = createProduct({
        ...validSource,
        coverImageUrl: null,
    });

    assert.equal(product.coverImageUrl, null);
});

test("rechaza propiedades que no forman parte del Product oficial", () => {
    const result = safeCreateProduct({
        ...validSource,
        boxes: 3,
    });

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
