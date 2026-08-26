import "server-only";

import type { AppError } from "@/lib/errors/app-error";

type ErrorContextValue = string | number | boolean | null;

export type ErrorContext = Readonly<Record<string, ErrorContextValue>>;

export function reportError(error: AppError, context: ErrorContext): void {
    const cause =
        error.cause instanceof Error
            ? {
                  name: error.cause.name,
                  message: error.cause.message,
              }
            : error.cause === undefined
              ? undefined
              : {
                    type: typeof error.cause,
                };

    console.error("[application-error]", {
        code: error.code,
        name: error.name,
        message: error.message,
        context,
        cause,
        stack: error.stack,
    });
}
