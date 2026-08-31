import "server-only";

import { AppError } from "./app-error";

type ErrorContextValue = string | number | boolean | null;

export type ErrorContext = Readonly<Record<string, ErrorContextValue>>;

export function reportError(error: AppError, context: ErrorContext): void {
    const cause =
        error.cause instanceof AppError
            ? {
                  name: error.cause.name,
                  code: error.cause.code,
              }
            : error.cause instanceof Error
              ? {
                    name: error.cause.name,
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
