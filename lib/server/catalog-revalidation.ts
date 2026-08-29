import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export const CATALOG_REVALIDATION_RATE_LIMIT = 5;
export const CATALOG_REVALIDATION_RATE_WINDOW_MS = 60_000;

export type RateLimitDecision = Readonly<{
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSeconds: number;
}>;

export type FixedWindowRateLimiter = Readonly<{
    consume(now?: number): RateLimitDecision;
}>;

type FixedWindowRateLimiterOptions = Readonly<{
    limit: number;
    windowMs: number;
}>;

type CatalogRevalidationHandlerDependencies = Readonly<{
    getExpectedSecret(): string | undefined;
    invalidateCatalog(): void;
    rateLimiter: FixedWindowRateLimiter;
}>;

function digestSecret(secret: string): Buffer {
    return createHash("sha256").update(secret, "utf8").digest();
}

export function isCatalogRevalidationAuthorized(
    authorizationHeader: string | null,
    expectedSecret: string,
): boolean {
    if (authorizationHeader === null || expectedSecret.length === 0) {
        return false;
    }

    const bearerMatch = /^Bearer\s+(.+)$/i.exec(authorizationHeader);

    if (!bearerMatch) {
        return false;
    }

    return timingSafeEqual(digestSecret(bearerMatch[1]), digestSecret(expectedSecret));
}

export function createFixedWindowRateLimiter({
    limit,
    windowMs,
}: FixedWindowRateLimiterOptions): FixedWindowRateLimiter {
    if (!Number.isInteger(limit) || limit < 1) {
        throw new RangeError("Rate limit must be a positive integer.");
    }

    if (!Number.isFinite(windowMs) || windowMs <= 0) {
        throw new RangeError("Rate limit window must be greater than zero.");
    }

    let windowStartedAt: number | null = null;
    let requestCount = 0;

    return {
        consume(now = Date.now()): RateLimitDecision {
            if (
                windowStartedAt === null ||
                now < windowStartedAt ||
                now >= windowStartedAt + windowMs
            ) {
                windowStartedAt = now;
                requestCount = 0;
            }

            if (requestCount >= limit) {
                return {
                    allowed: false,
                    limit,
                    remaining: 0,
                    retryAfterSeconds: Math.max(
                        1,
                        Math.ceil((windowStartedAt + windowMs - now) / 1_000),
                    ),
                };
            }

            requestCount += 1;

            return {
                allowed: true,
                limit,
                remaining: limit - requestCount,
                retryAfterSeconds: 0,
            };
        },
    };
}

export const catalogRevalidationRateLimiter = createFixedWindowRateLimiter({
    limit: CATALOG_REVALIDATION_RATE_LIMIT,
    windowMs: CATALOG_REVALIDATION_RATE_WINDOW_MS,
});

function createResponse(
    body: Readonly<Record<string, boolean | string>>,
    status: number,
    rateLimit: RateLimitDecision,
    extraHeaders?: Readonly<Record<string, string>>,
): Response {
    return Response.json(body, {
        status,
        headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            ...extraHeaders,
        },
    });
}

export function createCatalogRevalidationHandler({
    getExpectedSecret,
    invalidateCatalog,
    rateLimiter,
}: CatalogRevalidationHandlerDependencies): (request: Request) => Response {
    return (request: Request): Response => {
        const rateLimit = rateLimiter.consume();

        if (!rateLimit.allowed) {
            return createResponse({ error: "TOO_MANY_REQUESTS" }, 429, rateLimit, {
                "Retry-After": String(rateLimit.retryAfterSeconds),
            });
        }

        const expectedSecret = getExpectedSecret();

        if (!expectedSecret) {
            return createResponse({ error: "REVALIDATION_NOT_CONFIGURED" }, 503, rateLimit);
        }

        if (
            !isCatalogRevalidationAuthorized(request.headers.get("authorization"), expectedSecret)
        ) {
            return createResponse({ error: "UNAUTHORIZED" }, 401, rateLimit, {
                "WWW-Authenticate": "Bearer",
            });
        }

        invalidateCatalog();

        return createResponse({ revalidated: true }, 200, rateLimit);
    };
}
