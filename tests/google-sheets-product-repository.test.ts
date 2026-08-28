import assert from "node:assert/strict";
import test from "node:test";

import { GoogleSheetsProductRepository } from "../repositories/google-sheets-product-repository";
import type { Product } from "../types/product";

const products: readonly Product[] = [
    {
        sku: "AF-2M",
        artist: "Alejandro Fernández",
        album: "Dos Mundos",
        status: "Disponible",
        genre: "Regional mexicano",
        coverImageUrl: null,
    },
];

test("delega getAll en el cargador de productos de Google Sheets", async () => {
    let calls = 0;
    const repository = new GoogleSheetsProductRepository(() => {
        calls += 1;
        return Promise.resolve(products);
    });

    const result = await repository.getAll();

    assert.equal(calls, 1);
    assert.equal(result, products);
});

test("conserva los errores del origen para que el servicio los normalice", async () => {
    const sourceError = new Error("Google Sheets unavailable");
    const repository = new GoogleSheetsProductRepository(() => Promise.reject(sourceError));

    await assert.rejects(
        () => repository.getAll(),
        (error: unknown) => error === sourceError,
    );
});
