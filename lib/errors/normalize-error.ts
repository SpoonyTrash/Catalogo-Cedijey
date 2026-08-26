import { AppError, type AppErrorOptions } from "@/lib/errors/app-error";

type ErrorFallback = Readonly<Pick<AppErrorOptions, "code" | "message" | "userMessage">>;

const DEFAULT_ERROR_FALLBACK: ErrorFallback = {
    code: "UNKNOWN_ERROR",
    message: "Unexpected application error",
    userMessage: "Ocurrió un error inesperado. Intenta nuevamente.",
};

export function normalizeError(
    error: unknown,
    fallback: ErrorFallback = DEFAULT_ERROR_FALLBACK,
): AppError {
    if (error instanceof AppError) {
        return error;
    }

    const causeMessage = error instanceof Error ? error.message : "A non-Error value was thrown";

    return new AppError({
        code: fallback.code,
        message: `${fallback.message}: ${causeMessage}`,
        userMessage: fallback.userMessage,
        cause: error,
    });
}
