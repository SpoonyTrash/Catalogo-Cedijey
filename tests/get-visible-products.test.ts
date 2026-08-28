import assert from "node:assert/strict";
import test from "node:test";

import { getVisibleProducts } from "../lib/catalog/get-visible-products";
import type { Product } from "../types/product";

const products: readonly Product[] = [
    {
        sku: "ROCK-METALLICA",
        artist: "Metallica",
        album: "Master of Puppets",
        status: "Disponible",
        genre: "Rock",
        coverImageUrl: null,
    },
    {
        sku: "POP-METALLICA",
        artist: "Metallica Tribute",
        album: "Pop Sessions",
        status: "Disponible",
        genre: "Pop",
        coverImageUrl: null,
    },
    {
        sku: "ROCK-OTHER",
        artist: "Queen",
        album: "A Night at the Opera",
        status: "Disponible",
        genre: "Rock",
        coverImageUrl: null,
    },
];

test("combina el filtro de género con la búsqueda", () => {
    const result = getVisibleProducts(products, {
        selectedGenre: "rock",
        searchQuery: "metallica",
        sortOrder: "relevance",
    });

    assert.deepEqual(
        result.products.map((product) => product.sku),
        ["ROCK-METALLICA"],
    );
    assert.equal(result.totalProducts, 3);
    assert.equal(result.matchedProducts, 1);
});

test("aplica únicamente el género cuando la búsqueda está vacía", () => {
    const result = getVisibleProducts(products, {
        selectedGenre: "RÓCK",
        searchQuery: " ",
        sortOrder: "relevance",
    });

    assert.deepEqual(
        result.products.map((product) => product.sku),
        ["ROCK-METALLICA", "ROCK-OTHER"],
    );
    assert.equal(result.matchedProducts, 2);
});

test("aplica únicamente la búsqueda cuando el género es null", () => {
    const result = getVisibleProducts(products, {
        selectedGenre: null,
        searchQuery: "metallica",
        sortOrder: "relevance",
    });

    assert.deepEqual(
        result.products.map((product) => product.sku),
        ["ROCK-METALLICA", "POP-METALLICA"],
    );
    assert.equal(result.matchedProducts, 2);
});

test("sin criterios devuelve todo el catálogo y sus contadores", () => {
    const result = getVisibleProducts(products, {
        selectedGenre: null,
        searchQuery: "",
        sortOrder: "relevance",
    });

    assert.deepEqual(result.products, products);
    assert.notEqual(result.products, products);
    assert.equal(result.totalProducts, products.length);
    assert.equal(result.matchedProducts, products.length);
});

test("conserva el total original cuando no encuentra coincidencias", () => {
    const result = getVisibleProducts(products, {
        selectedGenre: "Rock",
        searchQuery: "inexistente",
        sortOrder: "relevance",
    });

    assert.deepEqual(result.products, []);
    assert.equal(result.totalProducts, 3);
    assert.equal(result.matchedProducts, 0);
});

test("aplica el orden alfabético después del filtro y la búsqueda", () => {
    const result = getVisibleProducts(products, {
        selectedGenre: null,
        searchQuery: "metallica",
        sortOrder: "alphabetical-desc",
    });

    assert.deepEqual(
        result.products.map((product) => product.sku),
        ["POP-METALLICA", "ROCK-METALLICA"],
    );
    assert.equal(result.totalProducts, 3);
    assert.equal(result.matchedProducts, 2);
});

test("no modifica el catálogo recibido", () => {
    const originalProducts = products.map((product) => ({ ...product }));

    getVisibleProducts(products, {
        selectedGenre: "Rock",
        searchQuery: "metallica",
        sortOrder: "relevance",
    });

    assert.deepEqual(products, originalProducts);
});
