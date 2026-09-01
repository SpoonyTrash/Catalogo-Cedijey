import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { GoogleSheetsUnavailableError } from "../lib/errors/google-sheets-error";
import { createCatalogUpdateObserver } from "../lib/server/catalog-observability";

const projectRoot = process.cwd();
const repositorySource = readFileSync(
    join(projectRoot, "repositories/google-sheets-products.repository.ts"),
    "utf8",
);
const routeSource = readFileSync(join(projectRoot, "app/api/revalidate/catalog/route.ts"), "utf8");
const errorPageSource = readFileSync(join(projectRoot, "app/error.tsx"), "utf8");

test("registra inicio y éxito con duración, conteos y fecha de actualización", () => {
    const timestamps = [1_000, 1_275];
    const events: Array<Readonly<Record<string, boolean | number | string | null>>> = [];
    const observer = createCatalogUpdateObserver({
        now: () => timestamps.shift() ?? 1_275,
        writeEvent: (event) => events.push(event),
    });

    const attempt = observer.start();
    observer.succeed(attempt, {
        validProductCount: 170,
        invalidRowCount: 12,
    });

    assert.equal(events.length, 2);
    assert.deepEqual(events[0], {
        event: "catalog-update-started",
        timestamp: "1970-01-01T00:00:01.000Z",
        source: "google-sheets",
        cacheTag: "catalog-products",
    });
    assert.deepEqual(events[1], {
        event: "catalog-update-succeeded",
        timestamp: "1970-01-01T00:00:01.275Z",
        source: "google-sheets",
        cacheTag: "catalog-products",
        durationMs: 275,
        validProductCount: 170,
        invalidRowCount: 12,
        lastSuccessfulUpdateAt: "1970-01-01T00:00:01.275Z",
    });
});

test("registra una razón controlada y conserva la última fecha correcta", () => {
    const timestamps = [2_000, 2_100, 3_000, 3_450];
    const events: Array<Readonly<Record<string, boolean | number | string | null>>> = [];
    const observer = createCatalogUpdateObserver({
        now: () => timestamps.shift() ?? 3_450,
        writeEvent: (event) => events.push(event),
    });

    const successfulAttempt = observer.start();
    observer.succeed(successfulAttempt, {
        validProductCount: 1,
        invalidRowCount: 0,
    });
    const failedAttempt = observer.start();
    observer.fail(
        failedAttempt,
        new GoogleSheetsUnavailableError(
            "sensitive technical message",
            "timeout",
            new Error("Bearer secret-token"),
        ),
    );

    const failureEvent = events[3];
    const serializedEvent = JSON.stringify(failureEvent);

    assert.deepEqual(failureEvent, {
        event: "catalog-update-failed",
        timestamp: "1970-01-01T00:00:03.450Z",
        source: "google-sheets",
        cacheTag: "catalog-products",
        durationMs: 450,
        reason: "timeout",
        lastSuccessfulUpdateAt: "1970-01-01T00:00:02.100Z",
    });
    assert.doesNotMatch(serializedEvent, /sensitive technical message|secret-token|Bearer/);
});

test("la actualización observa una lectura completa y vuelve a lanzar los fallos", () => {
    assert.match(repositorySource, /catalogUpdateObserver\.start\(\)/);
    assert.match(repositorySource, /catalogUpdateObserver\.succeed\(updateAttempt,/);
    assert.match(repositorySource, /validProductCount:\s*products\.length/);
    assert.match(repositorySource, /invalidRowCount:\s*records\.length\s*-\s*products\.length/);
    assert.match(repositorySource, /catalogUpdateObserver\.fail\(updateAttempt,\s*error\)/);
    assert.match(repositorySource, /throw\s+error/);
    assert.doesNotMatch(repositorySource, /return\s+\[\]/);
});

test("reintentar no invalida la caché y la actualización forzada sigue protegida", () => {
    assert.match(errorPageSource, /onRetry=\{reset\}/);
    assert.doesNotMatch(errorPageSource, /revalidateTag|router\.refresh|fetch\(/);

    assert.match(routeSource, /process\.env\.CATALOG_REVALIDATION_SECRET/);
    assert.match(
        routeSource,
        /revalidateTag\(CATALOG_PRODUCTS_CACHE_TAG,\s*\{\s*expire:\s*0\s*\}\)/,
    );
    assert.doesNotMatch(routeSource, /export\s+(?:async\s+)?function\s+GET/);
});
