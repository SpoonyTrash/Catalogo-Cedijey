import assert from "node:assert/strict";
import test from "node:test";

import { productSchema, type Product } from "../schemas/product.schema";

const validProduct = {
    sku: "ACDC-HELL",
    artist: "AC DC",
    album: "Highway To Hell",
    status: "Poco stock",
    genre: "Rock",
    coverImageUrl: "https://example.com/covers/acdc-hell.jpg",
} satisfies Product;

test("acepta un producto con los seis campos válidos", () => {
    const result = productSchema.safeParse(validProduct);

    assert.equal(result.success, true);

    if (result.success) {
        assert.deepEqual(result.data, validProduct);
    }
});

test("acepta una portada nula", () => {
    const result = productSchema.safeParse({
        ...validProduct,
        coverImageUrl: null,
    });

    assert.equal(result.success, true);
});

test("rechaza productos a los que les falte cualquiera de los seis campos", () => {
    const result = productSchema.safeParse({
        sku: validProduct.sku,
        artist: validProduct.artist,
        album: validProduct.album,
        status: validProduct.status,
        genre: validProduct.genre,
    });

    assert.equal(result.success, false);
});

test("rechaza campos obligatorios vacíos, con espacios o sin normalizar", () => {
    for (const [field, value] of [
        ["sku", ""],
        ["artist", "   "],
        ["album", " Highway To Hell"],
        ["status", "Poco stock "],
        ["genre", 42],
    ] as const) {
        const result = productSchema.safeParse({
            ...validProduct,
            [field]: value,
        });

        assert.equal(result.success, false, `${field} debió ser rechazado`);
    }
});

test("rechaza portadas vacías, relativas o con protocolos no HTTP", () => {
    for (const coverImageUrl of ["", "/covers/acdc.jpg", "ftp://example.com/acdc.jpg"]) {
        const result = productSchema.safeParse({
            ...validProduct,
            coverImageUrl,
        });

        assert.equal(result.success, false, `${coverImageUrl} debió ser rechazada`);
    }
});

test("rechaza propiedades adicionales que no pertenecen al modelo oficial", () => {
    const result = productSchema.safeParse({
        ...validProduct,
        boxes: 2,
    });

    assert.equal(result.success, false);

    if (!result.success) {
        assert.ok(result.error.issues.some((issue) => issue.code === "unrecognized_keys"));
    }
});
