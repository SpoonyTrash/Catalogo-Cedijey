import "server-only";

import { GoogleSheetsError, GoogleSheetsUnavailableError } from "../errors/google-sheets-error";

export const CATALOG_OBSERVABILITY_SOURCE = "google-sheets";
export const CATALOG_OBSERVABILITY_CACHE_TAG = "catalog-products";

type CatalogUpdateAttempt = Readonly<{
    startedAtMs: number;
}>;

type CatalogUpdateCounts = Readonly<{
    validProductCount: number;
    invalidRowCount: number;
}>;

type CatalogObservabilityEvent = Readonly<Record<string, boolean | number | string | null>>;

type CatalogObservabilityDependencies = Readonly<{
    now?: () => number;
    writeEvent?: (event: CatalogObservabilityEvent) => void;
}>;

function writeCatalogEvent(event: CatalogObservabilityEvent): void {
    process.stderr.write(`[catalog-observability] ${JSON.stringify(event)}\n`);
}

function toIsoDate(timestamp: number): string {
    return new Date(timestamp).toISOString();
}

function getFailureReason(error: unknown): string {
    if (error instanceof GoogleSheetsUnavailableError) {
        return error.reason;
    }

    if (error instanceof GoogleSheetsError) {
        return error.code;
    }

    if (error instanceof Error) {
        return error.name || "Error";
    }

    return "unknown";
}

/**
 * Creates a process-local observer for catalog refresh attempts. The last-success value is
 * diagnostic metadata only: it never acts as a product fallback or affects cache behavior.
 * Persisted logs remain the source of truth across serverless instances and deployments.
 */
export function createCatalogUpdateObserver({
    now = Date.now,
    writeEvent = writeCatalogEvent,
}: CatalogObservabilityDependencies = {}) {
    let lastSuccessfulUpdateAt: string | null = null;

    return {
        start(): CatalogUpdateAttempt {
            const startedAtMs = now();

            writeEvent({
                event: "catalog-update-started",
                timestamp: toIsoDate(startedAtMs),
                source: CATALOG_OBSERVABILITY_SOURCE,
                cacheTag: CATALOG_OBSERVABILITY_CACHE_TAG,
            });

            return { startedAtMs };
        },

        succeed(attempt: CatalogUpdateAttempt, counts: CatalogUpdateCounts): void {
            const completedAtMs = now();
            lastSuccessfulUpdateAt = toIsoDate(completedAtMs);

            writeEvent({
                event: "catalog-update-succeeded",
                timestamp: lastSuccessfulUpdateAt,
                source: CATALOG_OBSERVABILITY_SOURCE,
                cacheTag: CATALOG_OBSERVABILITY_CACHE_TAG,
                durationMs: Math.max(0, completedAtMs - attempt.startedAtMs),
                validProductCount: counts.validProductCount,
                invalidRowCount: counts.invalidRowCount,
                lastSuccessfulUpdateAt,
            });
        },

        fail(attempt: CatalogUpdateAttempt, error: unknown): void {
            const failedAtMs = now();

            writeEvent({
                event: "catalog-update-failed",
                timestamp: toIsoDate(failedAtMs),
                source: CATALOG_OBSERVABILITY_SOURCE,
                cacheTag: CATALOG_OBSERVABILITY_CACHE_TAG,
                durationMs: Math.max(0, failedAtMs - attempt.startedAtMs),
                reason: getFailureReason(error),
                lastSuccessfulUpdateAt,
            });
        },
    };
}

export const catalogUpdateObserver = createCatalogUpdateObserver();
