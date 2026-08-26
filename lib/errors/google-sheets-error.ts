import { AppError } from "./app-error";

export type GoogleSheetsErrorCode =
    | "GOOGLE_SHEETS_CONFIGURATION_ERROR"
    | "GOOGLE_SHEETS_AUTHENTICATION_ERROR"
    | "GOOGLE_SHEETS_UNAVAILABLE_ERROR"
    | "GOOGLE_SHEETS_READ_ERROR"
    | "GOOGLE_SHEETS_MAPPING_ERROR";

export type GoogleSheetsUnavailableReason = "timeout" | "network" | "rate_limited" | "server_error";

export class GoogleSheetsError extends AppError {
    declare readonly code: GoogleSheetsErrorCode;
    readonly originalCause?: unknown;

    constructor(
        code: GoogleSheetsErrorCode,
        message: string,
        userMessage: string,
        originalCause?: unknown,
    ) {
        super({
            code,
            message,
            userMessage,
            cause: originalCause,
        });

        this.name = "GoogleSheetsError";
        this.originalCause = originalCause;
    }
}

export class GoogleSheetsConfigurationError extends GoogleSheetsError {
    constructor(message: string) {
        super(
            "GOOGLE_SHEETS_CONFIGURATION_ERROR",
            message,
            "El servicio de inventario no está configurado correctamente.",
        );
        this.name = "GoogleSheetsConfigurationError";
    }
}

export class GoogleSheetsAuthenticationError extends GoogleSheetsError {
    constructor(message: string, originalCause?: unknown) {
        super(
            "GOOGLE_SHEETS_AUTHENTICATION_ERROR",
            message,
            "No fue posible conectar con el servicio de inventario.",
            originalCause,
        );
        this.name = "GoogleSheetsAuthenticationError";
    }
}

export class GoogleSheetsUnavailableError extends GoogleSheetsError {
    readonly reason: GoogleSheetsUnavailableReason;

    constructor(message: string, reason: GoogleSheetsUnavailableReason, originalCause?: unknown) {
        super(
            "GOOGLE_SHEETS_UNAVAILABLE_ERROR",
            message,
            "El servicio de inventario no está disponible temporalmente. Intenta nuevamente.",
            originalCause,
        );
        this.name = "GoogleSheetsUnavailableError";
        this.reason = reason;
    }
}

export class GoogleSheetsReadError extends GoogleSheetsError {
    constructor(message: string, originalCause?: unknown) {
        super(
            "GOOGLE_SHEETS_READ_ERROR",
            message,
            "No fue posible consultar el inventario. Intenta nuevamente.",
            originalCause,
        );
        this.name = "GoogleSheetsReadError";
    }
}

export class GoogleSheetsMappingError extends GoogleSheetsError {
    constructor(message: string, originalCause?: unknown) {
        super(
            "GOOGLE_SHEETS_MAPPING_ERROR",
            message,
            "Los datos del inventario no tienen el formato esperado.",
            originalCause,
        );
        this.name = "GoogleSheetsMappingError";
    }
}
