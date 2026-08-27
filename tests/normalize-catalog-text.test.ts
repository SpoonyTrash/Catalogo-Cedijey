import assert from "node:assert/strict";
import test from "node:test";

import { normalizeCatalogText } from "../lib/catalog/normalize-catalog-text";

test("normaliza mayúsculas, acentos y espacios externos", () => {
    assert.equal(normalizeCatalogText("  Alejandro   Fernández "), "alejandro fernandez");
});

test("colapsa tabulaciones, saltos de línea y espacios consecutivos", () => {
    assert.equal(normalizeCatalogText("Rock\t  en\nEspañol"), "rock en espanol");
});

test("permite buscar nombres con diéresis, tildes o eñe sin diacríticos", () => {
    assert.equal(normalizeCatalogText("MÚSICA de Pingüino Muñoz"), "musica de pinguino munoz");
});

test("conserva puntuación y símbolos que pertenecen al nombre", () => {
    assert.equal(normalizeCatalogText("AC/DC: Live!"), "ac/dc: live!");
});

test("devuelve texto vacío cuando solo recibe espacios", () => {
    assert.equal(normalizeCatalogText("  \t\n  "), "");
});
