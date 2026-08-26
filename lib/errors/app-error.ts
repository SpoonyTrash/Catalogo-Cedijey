import type { AppErrorCode } from "@/lib/errors/error-codes";

export type AppErrorOptions = Readonly<{
    code: AppErrorCode;
    message: string;
    userMessage: string;
    cause?: unknown;
}>;

export class AppError extends Error {
    readonly code: AppErrorCode;
    readonly userMessage: string;
    readonly cause?: unknown;

    constructor({ code, message, userMessage, cause }: AppErrorOptions) {
        super(message);

        this.name = "AppError";
        this.code = code;
        this.userMessage = userMessage;
        this.cause = cause;
    }
}
