import assert from "node:assert/strict";
import test from "node:test";

import {
    GoogleSheetsConfigurationError,
    GoogleSheetsReadError,
    GoogleSheetsUnavailableError,
} from "../lib/errors/google-sheets-error";
import {
    GOOGLE_SHEETS_REQUEST_OPTIONS,
    GOOGLE_SHEETS_REQUEST_TIMEOUT_MS,
    getGoogleSheetsUnavailableReason,
    runGoogleSheetsOperation,
    toGoogleSheetsError,
} from "../lib/google/google-sheets-request";

test("limita cada solicitud a Google y desactiva reintentos implícitos", () => {
    assert.equal(GOOGLE_SHEETS_REQUEST_TIMEOUT_MS, 8_000);
    assert.deepEqual(GOOGLE_SHEETS_REQUEST_OPTIONS, {
        timeout: 8_000,
        retry: false,
    });
});

test("reconoce timeouts, errores de red y respuestas transitorias", () => {
    assert.equal(getGoogleSheetsUnavailableReason({ code: "ETIMEDOUT" }), "timeout");
    assert.equal(getGoogleSheetsUnavailableReason({ cause: { code: "ENOTFOUND" } }), "network");
    assert.equal(getGoogleSheetsUnavailableReason({ response: { status: 429 } }), "rate_limited");
    assert.equal(getGoogleSheetsUnavailableReason({ response: { status: 503 } }), "server_error");
    assert.equal(getGoogleSheetsUnavailableReason({ response: { status: 403 } }), null);
});

test("convierte la falta de respuesta en un error seguro y reintentable", async () => {
    const lowLevelError = Object.assign(new Error("detalle-interno-sensible"), {
        code: "ETIMEDOUT",
    });

    await assert.rejects(
        () =>
            runGoogleSheetsOperation("read", () => {
                throw lowLevelError;
            }),
        (error: unknown) => {
            assert.ok(error instanceof GoogleSheetsUnavailableError);
            assert.equal(error.code, "GOOGLE_SHEETS_UNAVAILABLE_ERROR");
            assert.equal(error.reason, "timeout");
            assert.equal(
                error.userMessage,
                "El servicio de inventario no está disponible temporalmente. Intenta nuevamente.",
            );
            assert.equal(error.message.includes("detalle-interno-sensible"), false);
            assert.equal(error.originalCause, lowLevelError);

            return true;
        },
    );
});

test("mantiene los errores controlados y separa fallos permanentes de lectura", () => {
    const configurationError = new GoogleSheetsConfigurationError("Falta GOOGLE_SHEET_ID.");

    assert.equal(toGoogleSheetsError(configurationError, "read"), configurationError);
    assert.ok(
        toGoogleSheetsError({ response: { status: 403 } }, "read") instanceof GoogleSheetsReadError,
    );
});
