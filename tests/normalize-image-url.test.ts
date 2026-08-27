import assert from "node:assert/strict";
import test from "node:test";

import { normalizeImageUrl } from "../lib/images/normalize-image-url";

test("conserva URLs HTTP y HTTPS públicas", () => {
    assert.equal(
        normalizeImageUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg"),
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    );
    assert.equal(normalizeImageUrl("http://example.com/cover.jpg"), "http://example.com/cover.jpg");
});

test("elimina espacios al inicio y al final", () => {
    assert.equal(
        normalizeImageUrl("  https://example.com/cover.jpg  "),
        "https://example.com/cover.jpg",
    );
});

test("agrega HTTPS a dominios sin protocolo", () => {
    assert.equal(
        normalizeImageUrl("res.cloudinary.com/demo/image/upload/sample.jpg"),
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    );
});

test("agrega HTTPS a URLs relativas al protocolo", () => {
    assert.equal(
        normalizeImageUrl("//cdn.example.com/cover.jpg"),
        "https://cdn.example.com/cover.jpg",
    );
});

test("no aplica transformaciones específicas del proveedor", () => {
    assert.equal(
        normalizeImageUrl("https://drive.google.com/file/d/example/view"),
        "https://drive.google.com/file/d/example/view",
    );
});

test("devuelve null para valores vacíos o nulos", () => {
    for (const value of ["", "   ", null]) {
        assert.equal(normalizeImageUrl(value), null);
    }
});

test("conserva valores inválidos para que la capa de validación pueda reportarlos", () => {
    for (const value of [
        "/covers/album.jpg",
        "ftp://example.com/cover.jpg",
        "javascript:alert(1)",
        undefined,
        42,
    ]) {
        assert.equal(normalizeImageUrl(value), value);
    }
});
