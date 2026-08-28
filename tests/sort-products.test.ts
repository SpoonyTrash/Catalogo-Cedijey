import assert from "node:assert/strict";
import test from "node:test";

import { sortProducts } from "../lib/catalog/sort-products";
import type { Product } from "../types/product";

function makeProduct(sku: string, artist: string, album: string): Product {
    return {
        sku,
        artist,
        album,
        status: "Disponible",
        genre: "Rock",
        coverImageUrl: null,
    };
}

const products: readonly Product[] = [
    makeProduct("ALBUM-10", "Zoé", "Álbum 10"),
    makeProduct("NIGHT", "Queen", "A Night at the Opera"),
    makeProduct("ALBUM-2", "Metallica", "album 2"),
    makeProduct("HITS", "Soda Stereo", "Éxitos"),
];

test("conserva el orden de relevancia en un arreglo nuevo", () => {
    const sortedProducts = sortProducts(products, "relevance");

    assert.deepEqual(sortedProducts, products);
    assert.notEqual(sortedProducts, products);
});

test("ordena álbumes de A a Z ignorando acentos y usando números naturales", () => {
    assert.deepEqual(
        sortProducts(products, "alphabetical-asc").map((product) => product.sku),
        ["NIGHT", "ALBUM-2", "ALBUM-10", "HITS"],
    );
});

test("ordena álbumes de Z a A", () => {
    assert.deepEqual(
        sortProducts(products, "alphabetical-desc").map((product) => product.sku),
        ["HITS", "ALBUM-10", "ALBUM-2", "NIGHT"],
    );
});

test("desempata títulos iguales por artista y SKU", () => {
    const duplicatedTitles = [
        makeProduct("SAME-20", "Zoé", "Mismo álbum"),
        makeProduct("SAME-10", "Álvaro", "mismo album"),
        makeProduct("SAME-2", "Álvaro", "Mismo Álbum"),
    ];

    assert.deepEqual(
        sortProducts(duplicatedTitles, "alphabetical-asc").map((product) => product.sku),
        ["SAME-2", "SAME-10", "SAME-20"],
    );
});

test("no modifica los productos ni el orden del catálogo recibido", () => {
    const originalProducts = products.map((product) => ({ ...product }));

    sortProducts(products, "alphabetical-desc");

    assert.deepEqual(products, originalProducts);
});
