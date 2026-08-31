import assert from "node:assert/strict";
import test from "node:test";

import {
    createCatalogRevalidationHandler,
    createFixedWindowRateLimiter,
    isCatalogRevalidationAuthorized,
} from "../lib/server/catalog-revalidation";

const EXPECTED_SECRET = "a-secure-catalog-revalidation-secret";

function createRequest(secret?: string, url = "https://example.com/api/revalidate/catalog") {
    const headers = new Headers();

    if (secret !== undefined) {
        headers.set("Authorization", `Bearer ${secret}`);
    }

    return new Request(url, {
        method: "POST",
        headers,
    });
}

type TestHandlerOptions = Readonly<{
    expectedSecret?: string;
    limit?: number;
}>;

function createTestHandler(options: TestHandlerOptions = {}) {
    const expectedSecret = Object.hasOwn(options, "expectedSecret")
        ? options.expectedSecret
        : EXPECTED_SECRET;
    const limit = options.limit ?? 5;
    let invalidationCount = 0;
    const handler = createCatalogRevalidationHandler({
        getExpectedSecret: () => expectedSecret,
        invalidateCatalog: () => {
            invalidationCount += 1;
        },
        rateLimiter: createFixedWindowRateLimiter({
            limit,
            windowMs: 60_000,
        }),
    });

    return {
        handler,
        getInvalidationCount: () => invalidationCount,
    };
}

test("autoriza únicamente el secreto Bearer correcto", () => {
    assert.equal(
        isCatalogRevalidationAuthorized(`Bearer ${EXPECTED_SECRET}`, EXPECTED_SECRET),
        true,
    );
    assert.equal(
        isCatalogRevalidationAuthorized(`bearer ${EXPECTED_SECRET}`, EXPECTED_SECRET),
        true,
    );
    assert.equal(isCatalogRevalidationAuthorized(null, EXPECTED_SECRET), false);
    assert.equal(isCatalogRevalidationAuthorized(EXPECTED_SECRET, EXPECTED_SECRET), false);
    assert.equal(isCatalogRevalidationAuthorized("Bearer incorrect", EXPECTED_SECRET), false);
    assert.equal(isCatalogRevalidationAuthorized("Bearer anything", ""), false);
});

test("invalida el catálogo sin devolver datos ni secretos", async () => {
    const subject = createTestHandler();
    const response = subject.handler(createRequest(EXPECTED_SECRET));
    const responseText = await response.text();

    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(responseText), { revalidated: true });
    assert.equal(subject.getInvalidationCount(), 1);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.doesNotMatch(responseText, /secret|product|credential/i);
});

test("rechaza encabezados ausentes o incorrectos", async () => {
    for (const request of [createRequest(), createRequest("incorrect")]) {
        const subject = createTestHandler();
        const response = subject.handler(request);

        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { error: "UNAUTHORIZED" });
        assert.equal(response.headers.get("WWW-Authenticate"), "Bearer");
        assert.equal(subject.getInvalidationCount(), 0);
    }
});

test("ignora un secreto enviado en la URL", () => {
    const subject = createTestHandler();
    const response = subject.handler(
        createRequest(
            undefined,
            `https://example.com/api/revalidate/catalog?secret=${EXPECTED_SECRET}`,
        ),
    );

    assert.equal(response.status, 401);
    assert.equal(subject.getInvalidationCount(), 0);
});

test("falla de forma segura cuando el secreto del servidor no está configurado", async () => {
    const subject = createTestHandler({ expectedSecret: undefined });
    const response = subject.handler(createRequest(EXPECTED_SECRET));

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "REVALIDATION_NOT_CONFIGURED" });
    assert.equal(subject.getInvalidationCount(), 0);
});

test("limita todos los intentos antes de volver a invalidar", async () => {
    const subject = createTestHandler({ limit: 2 });

    assert.equal(subject.handler(createRequest(EXPECTED_SECRET)).status, 200);
    assert.equal(subject.handler(createRequest(EXPECTED_SECRET)).status, 200);

    const blockedResponse = subject.handler(createRequest(EXPECTED_SECRET));

    assert.equal(blockedResponse.status, 429);
    assert.deepEqual(await blockedResponse.json(), { error: "TOO_MANY_REQUESTS" });
    assert.equal(blockedResponse.headers.get("X-RateLimit-Remaining"), "0");
    assert.ok(Number(blockedResponse.headers.get("Retry-After")) >= 1);
    assert.equal(subject.getInvalidationCount(), 2);
});

test("reinicia el límite al comenzar una nueva ventana", () => {
    const limiter = createFixedWindowRateLimiter({ limit: 2, windowMs: 1_000 });

    assert.equal(limiter.consume(100).allowed, true);
    assert.equal(limiter.consume(200).allowed, true);

    const blockedDecision = limiter.consume(999);

    assert.equal(blockedDecision.allowed, false);
    assert.equal(blockedDecision.retryAfterSeconds, 1);
    assert.equal(limiter.consume(1_100).allowed, true);
});

test("rechaza configuraciones inválidas del límite", () => {
    assert.throws(() => createFixedWindowRateLimiter({ limit: 0, windowMs: 1_000 }), RangeError);
    assert.throws(() => createFixedWindowRateLimiter({ limit: 1, windowMs: 0 }), RangeError);
});
