import assert from "node:assert/strict";
import test from "node:test";

import {
    getRelatedProducts,
    getRelatedProductsByArtist,
    getRelatedProductsByGenre,
} from "../lib/catalog/related-products";
import type { Product } from "../types/product";

function makeProduct(sku: string, artist: string, album: string, genre: string): Product {
    return {
        sku,
        artist,
        album,
        status: "Disponible",
        genre,
        coverImageUrl: null,
    };
}

const currentProduct = makeProduct(
    "CURRENT",
    "Alejandro Fernández",
    "Dos Mundos",
    "Regional mexicano",
);

const products: readonly Product[] = [
    currentProduct,
    makeProduct("ARTIST-ONE", "Alejandro Fernandez", "Hecho en México", "Mariachi"),
    makeProduct("GENRE-ONE", "Vicente Fernández", "Para siempre", "REGIONAL MEXICANO"),
    makeProduct(
        "ARTIST-AND-GENRE",
        "  ALEJANDRO   FERNÁNDEZ ",
        "Confidencias",
        "Regional mexicano",
    ),
    makeProduct("OTHER", "Luis Miguel", "Romance", "Bolero"),
    makeProduct("GENRE-TWO", "Pepe Aguilar", "Por mujeres como tú", "Regional mexicano"),
];

test("10.7 obtiene todos los álbumes del artista y excluye el actual", () => {
    assert.deepEqual(
        getRelatedProductsByArtist(products, currentProduct).map((product) => product.sku),
        ["ARTIST-ONE", "ARTIST-AND-GENRE"],
    );
});

test("10.7 compara artistas ignorando acentos, mayúsculas y espacios", () => {
    const matches = getRelatedProductsByArtist(
        [
            makeProduct("ONE", "JOSE JOSE", "Álbum uno", "Balada"),
            makeProduct("TWO", "José   José", "Álbum dos", "Balada"),
        ],
        makeProduct("CURRENT-JJ", "José José", "Álbum actual", "Balada"),
    );

    assert.deepEqual(
        matches.map((product) => product.sku),
        ["ONE", "TWO"],
    );
});

test("10.8 obtiene todos los álbumes del género y excluye el actual", () => {
    assert.deepEqual(
        getRelatedProductsByGenre(products, currentProduct).map((product) => product.sku),
        ["GENRE-ONE", "ARTIST-AND-GENRE", "GENRE-TWO"],
    );
});

test("agrupa primero por artista y después por género sin repetir productos", () => {
    const relatedProducts = getRelatedProducts(products, currentProduct);

    assert.deepEqual(
        relatedProducts.byArtist.map((product) => product.sku),
        ["ARTIST-ONE", "ARTIST-AND-GENRE"],
    );
    assert.deepEqual(
        relatedProducts.byGenre.map((product) => product.sku),
        ["GENRE-ONE", "GENRE-TWO"],
    );
});

test("excluye el producto actual por SKU aunque sea otra instancia", () => {
    const duplicateCurrentProduct = { ...currentProduct, album: "Duplicado del actual" };
    const relatedProducts = getRelatedProducts(
        [duplicateCurrentProduct, ...products.slice(1)],
        currentProduct,
    );

    assert.equal(
        [...relatedProducts.byArtist, ...relatedProducts.byGenre].some(
            (product) => product.sku === currentProduct.sku,
        ),
        false,
    );
});

test("elimina SKU duplicados usando la clave normalizada", () => {
    const duplicateProducts = [
        makeProduct("SAME-SKU", "Alejandro Fernández", "Primero", "Regional mexicano"),
        makeProduct(" same-sku ", "Alejandro Fernández", "Segundo", "Regional mexicano"),
    ];
    const relatedProducts = getRelatedProducts(duplicateProducts, currentProduct);

    assert.deepEqual(
        relatedProducts.byArtist.map((product) => product.album),
        ["Primero"],
    );
    assert.deepEqual(relatedProducts.byGenre, []);
});

test("mantiene el orden y no modifica el catálogo recibido", () => {
    const originalProducts = products.map((product) => ({ ...product }));

    getRelatedProducts(products, currentProduct);

    assert.deepEqual(products, originalProducts);
});

test("devuelve ambos grupos vacíos cuando no existen relacionados", () => {
    assert.deepEqual(getRelatedProducts([currentProduct], currentProduct), {
        byArtist: [],
        byGenre: [],
    });
    assert.deepEqual(getRelatedProducts([], currentProduct), {
        byArtist: [],
        byGenre: [],
    });
});
