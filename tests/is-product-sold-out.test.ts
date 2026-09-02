import assert from "node:assert/strict";
import test from "node:test";

import { isProductSoldOut } from "../lib/products/is-product-sold-out";

test("reconoce estados agotados aunque cambien mayúsculas o caracteres invisibles", () => {
    for (const status of ["Agotado", "AGOTADO", "  agotado  ", "AGOTADO\u200B", "Agotados"]) {
        assert.equal(isProductSoldOut(status), true, status);
    }
});

test("reconoce las expresiones equivalentes utilizadas por inventarios", () => {
    for (const status of ["Sin stock", "No disponible", "Fuera de stock"]) {
        assert.equal(isProductSoldOut(status), true, status);
    }
});

test("no marca como agotados los demás estados", () => {
    for (const status of ["Disponible", "Poco stock", "Nuevo", ""]) {
        assert.equal(isProductSoldOut(status), false, status);
    }
});
