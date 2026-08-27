import assert from "node:assert/strict";
import test from "node:test";

import {
    type InvalidProductRowReport,
    validateProductRows,
} from "../lib/google/product-row-validator";
import type { RawProductSheetRecord } from "../types/google-sheets";

const validRecord: RawProductSheetRecord = {
    sku: "ACDC-HELL",
    artist: "AC DC",
    album: "Highway To Hell",
    status: "Poco stock",
    genre: "Rock",
    coverImage: "https://example.com/covers/acdc-hell.jpg",
};

test("conserva productos válidos aunque existan filas inválidas", () => {
    const reports: InvalidProductRowReport[] = [];

    const products = validateProductRows(
        [
            validRecord,
            {
                ...validRecord,
                sku: "",
            },
            {
                ...validRecord,
                sku: "MET-BLACK",
                artist: "Metallica",
                album: "Metallica",
            },
        ],
        (report) => reports.push(report),
    );

    assert.equal(products.length, 2);
    assert.equal(products[0]?.sku, "ACDC-HELL");
    assert.equal(products[1]?.sku, "MET-BLACK");
    assert.equal(reports.length, 1);
    assert.equal(reports[0]?.rowNumber, 3);
    assert.equal(reports[0]?.sku, null);
    assert.ok(reports[0]?.issues.some((issue) => issue.field === "sku"));
});

test("reporta el número real de fila de Google Sheets y el SKU cuando está disponible", () => {
    const reports: InvalidProductRowReport[] = [];

    validateProductRows(
        [
            validRecord,
            {
                ...validRecord,
                sku: "BROKEN-ROW",
                genre: " ",
            },
        ],
        (report) => reports.push(report),
    );

    assert.deepEqual(
        reports.map(({ rowNumber, sku }) => ({ rowNumber, sku })),
        [{ rowNumber: 3, sku: "BROKEN-ROW" }],
    );
    assert.ok(reports[0]?.issues.some((issue) => issue.field === "genre"));
});

test("puede omitir todas las filas inválidas sin lanzar una excepción", () => {
    const reports: InvalidProductRowReport[] = [];

    const products = validateProductRows(
        [
            {
                ...validRecord,
                sku: "",
            },
            {
                ...validRecord,
                artist: null,
            },
        ],
        (report) => reports.push(report),
    );

    assert.deepEqual(products, []);
    assert.equal(reports.length, 2);
});

test("acepta una portada nula como producto válido", () => {
    const products = validateProductRows([
        {
            ...validRecord,
            coverImage: null,
        },
    ]);

    assert.equal(products.length, 1);
    assert.equal(products[0]?.coverImageUrl, null);
});
