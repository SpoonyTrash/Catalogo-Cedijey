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

    const event = {
        code: error.code,
        name: error.name,
        message: error.message,
        context,
        cause,
        stack: error.stack,
    };

    // Keep logs produced during a cached fill on the server. Console calls are replayed by React
    // in development and can make Next.js serialize the event into the RSC stream.
    process.stderr.write(`[application-error] ${JSON.stringify(event)}\n`);
}
