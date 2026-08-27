import assert from "node:assert/strict";
import test from "node:test";

import type { CatalogQuery, CatalogResult, RelatedProducts } from "../types/catalog";
import type { Product } from "../types/product";

const product = {
    sku: "AF-2M",
    artist: "Alejandro Fernández",
    album: "Dos Mundos",
    status: "Disponible",
    genre: "Regional mexicano",
    coverImageUrl: null,
} satisfies Product;

test("define la consulta del catálogo con género y búsqueda", () => {
    const query = {
        selectedGenre: "Regional mexicano",
        searchQuery: "Alejandro Fernández",
    } satisfies CatalogQuery;

    assert.deepEqual(Object.keys(query).sort(), ["searchQuery", "selectedGenre"]);
});

test("separa productos relacionados por artista y género", () => {
    const relatedProducts = {
        byArtist: [product],
        byGenre: [],
    } satisfies RelatedProducts;

    assert.deepEqual(Object.keys(relatedProducts).sort(), ["byArtist", "byGenre"]);
    assert.deepEqual(relatedProducts.byArtist, [product]);
});

test("describe los resultados visibles y sus contadores", () => {
    const result = {
        products: [product],
        totalProducts: 3,
        matchedProducts: 1,
    } satisfies CatalogResult;

    assert.deepEqual(Object.keys(result).sort(), ["matchedProducts", "products", "totalProducts"]);
    assert.equal(result.products.length, result.matchedProducts);
});
