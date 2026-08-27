import assert from "node:assert/strict";
import test from "node:test";

import { normalizeImageUrl } from "../lib/images/normalize-image-url";

test("conserva y canonicaliza URLs HTTP y HTTPS válidas", () => {
    assert.equal(
        normalizeImageUrl(" https://example.com/covers/album.jpg "),
        "https://example.com/covers/album.jpg",
    );
    assert.equal(normalizeImageUrl("http://example.com/a.png"), "http://example.com/a.png");
});

test("agrega HTTPS a hosts sin protocolo y URLs protocol-relative", () => {
    assert.equal(
        normalizeImageUrl("example.com/covers/album.jpg"),
        "https://example.com/covers/album.jpg",
    );
    assert.equal(
        normalizeImageUrl("//cdn.example.com/covers/album.jpg"),
        "https://cdn.example.com/covers/album.jpg",
    );
});

test("convierte enlaces compartidos de Google Drive a una URL de visualización", () => {
    assert.equal(
        normalizeImageUrl("https://drive.google.com/file/d/abc123/view?usp=sharing"),
        "https://drive.google.com/uc?export=view&id=abc123",
    );
    assert.equal(
        normalizeImageUrl("https://drive.google.com/open?id=xyz789"),
        "https://drive.google.com/uc?export=view&id=xyz789",
    );
});

test("devuelve null para valores vacíos, no textuales, relativos o con protocolos inseguros", () => {
    for (const value of [
        null,
        undefined,
        42,
        "",
        "   ",
        "/covers/album.jpg",
        "ftp://example.com/album.jpg",
        "javascript:alert(1)",
    ]) {
        assert.equal(normalizeImageUrl(value), null);
    }
});
