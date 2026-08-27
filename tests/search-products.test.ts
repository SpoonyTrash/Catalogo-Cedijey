import assert from "node:assert/strict";
import test from "node:test";

import { searchProducts } from "../lib/catalog/search-products";
import type { Product } from "../types/product";

function makeProduct(sku: string, artist: string, album: string, genre = "Rock"): Product {
    return {
        sku,
        artist,
        album,
        status: "Disponible",
        genre,
        coverImageUrl: null,
    };
}

test("una búsqueda vacía devuelve todo el catálogo en un arreglo nuevo", () => {
    const products = [
        makeProduct("ONE", "Artista uno", "Álbum uno"),
        makeProduct("TWO", "Artista dos", "Álbum dos"),
    ];
    const matches = searchProducts(products, "   ");

    assert.deepEqual(matches, products);
    assert.notEqual(matches, products);
});

test("busca todos los álbumes de un artista ignorando acentos, mayúsculas y espacios", () => {
    const products = [
        makeProduct("AF-ONE", "Alejandro Fernández", "Hecho en México"),
        makeProduct("AF-TWO", "Alejandro Fernández", "Dos Mundos"),
        makeProduct("OTHER", "Vicente Fernández", "Para siempre"),
    ];

    assert.deepEqual(
        searchProducts(products, "  ALEJANDRO   FERNANDEZ ").map((product) => product.sku),
        ["AF-ONE", "AF-TWO"],
    );
});

test("encuentra coincidencias parciales en varios nombres de álbum", () => {
    const products = [
        makeProduct("ONE", "Alejandro Fernández", "Dos Mundos"),
        makeProduct("TWO", "Alejandro Fernández", "Mundo de éxitos"),
        makeProduct("THREE", "Otro artista", "Sin coincidencia"),
    ];

    assert.deepEqual(
        searchProducts(products, "mundo").map((product) => product.sku),
        ["TWO", "ONE"],
    );
});

test("ordena por relevancia y conserva el orden del catálogo en los empates", () => {
    const products = [
        makeProduct("ARTIST-CONTAINS", "The Metallica Experience", "Blackened"),
        makeProduct("ALBUM-CONTAINS", "Varios", "Best of Metallica"),
        makeProduct("ARTIST-EXACT-ONE", "Metallica", "Master of Puppets"),
        makeProduct("ALBUM-STARTS-ONE", "Varios", "Metallica Forever"),
        makeProduct("ALBUM-EXACT", "Varios", "Metallica"),
        makeProduct("ARTIST-STARTS", "Metallica Tribute", "Orion"),
        makeProduct("ARTIST-EXACT-TWO", "Metallica", "Ride the Lightning"),
        makeProduct("ALBUM-STARTS-TWO", "Varios", "Metallica Revisited"),
    ];

    assert.deepEqual(
        searchProducts(products, "metallica").map((product) => product.sku),
        [
            "ALBUM-EXACT",
            "ALBUM-STARTS-ONE",
            "ALBUM-STARTS-TWO",
            "ALBUM-CONTAINS",
            "ARTIST-EXACT-ONE",
            "ARTIST-EXACT-TWO",
            "ARTIST-STARTS",
            "ARTIST-CONTAINS",
        ],
    );
});

test("elimina SKU duplicados conservando la coincidencia mejor posicionada", () => {
    const products = [
        makeProduct("DUPLICATE", "Metallica", "Master of Puppets"),
        makeProduct(" duplicate ", "Varios", "Metallica"),
    ];
    const matches = searchProducts(products, "metallica");

    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.album, "Metallica");
});

test("devuelve un arreglo vacío cuando no hay coincidencias", () => {
    assert.deepEqual(searchProducts([makeProduct("ONE", "Artista", "Álbum")], "inexistente"), []);
});

test("no modifica los productos ni el orden del catálogo recibido", () => {
    const products = [
        makeProduct("ONE", "Metallica", "Master of Puppets"),
        makeProduct("TWO", "Varios", "Metallica"),
    ];
    const originalProducts = products.map((product) => ({ ...product }));

    searchProducts(products, "metallica");

    assert.deepEqual(products, originalProducts);
});
