import assert from "node:assert/strict";
import test from "node:test";

import { filterProductsByGenre, getAvailableGenres } from "../lib/catalog/genre-selctors";
import type { Product } from "../types/product";

const products: readonly Product[] = [
    {
        sku: "ROCK-ONE",
        artist: "Artista uno",
        album: "Álbum uno",
        status: "Disponible",
        genre: "Rock",
        coverImageUrl: null,
    },
    {
        sku: "POP-ONE",
        artist: "Artista dos",
        album: "Álbum dos",
        status: "Disponible",
        genre: "Pop rock",
        coverImageUrl: null,
    },
    {
        sku: "ROCK-TWO",
        artist: "Artista tres",
        album: "Álbum tres",
        status: "Disponible",
        genre: "Róck",
        coverImageUrl: null,
    },
    {
        sku: "REGIONAL-ONE",
        artist: "Artista cuatro",
        album: "Álbum cuatro",
        status: "Disponible",
        genre: "Regional mexicano",
        coverImageUrl: null,
    },
];

test("obtiene géneros únicos ignorando mayúsculas y diacríticos", () => {
    assert.deepEqual(getAvailableGenres(products), ["Pop rock", "Regional mexicano", "Rock"]);
});

test("conserva la primera escritura encontrada para cada género", () => {
    const genres = getAvailableGenres([
        { ...products[0]!, genre: "ROCK" },
        { ...products[2]!, genre: "rock" },
    ]);

    assert.deepEqual(genres, ["ROCK"]);
});

test("no agrega la opción visual Todos ni modifica el catálogo original", () => {
    const originalProducts = products.map((product) => ({ ...product }));
    const genres = getAvailableGenres(products);

    assert.equal(genres.includes("Todos"), false);
    assert.deepEqual(products, originalProducts);
});

test("devuelve todos los productos en un arreglo nuevo cuando el género es null", () => {
    const filteredProducts = filterProductsByGenre(products, null);

    assert.deepEqual(filteredProducts, products);
    assert.notEqual(filteredProducts, products);
});

test("filtra con texto normalizado y conserva el orden original", () => {
    const filteredProducts = filterProductsByGenre(products, "  RÓCK ");

    assert.deepEqual(
        filteredProducts.map((product) => product.sku),
        ["ROCK-ONE", "ROCK-TWO"],
    );
});

test("devuelve un arreglo vacío cuando el género no existe", () => {
    assert.deepEqual(filterProductsByGenre(products, "Jazz"), []);
});

test("maneja un catálogo vacío", () => {
    assert.deepEqual(getAvailableGenres([]), []);
    assert.deepEqual(filterProductsByGenre([], null), []);
    assert.deepEqual(filterProductsByGenre([], "Rock"), []);
});
