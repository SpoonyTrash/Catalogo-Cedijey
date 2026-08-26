export type GooglSheetsErrorCode =
    | "GOOGLE_SHEETS_CONFIGURATION_ERROR"
    | "GOOGLE_SHEETS_AUTHENTICATION_ERROR"
    | "GOOGLE_SHEETS_READ_ERROR"
    | "GOOGLE_SHEETS_MAPPING_ERROR";

export class GoogleSheetsError extends Error {
    readonly code: GooglSheetsErrorCode;
    readonly originalCause?: unknown;

    constructor(code: GooglSheetsErrorCode, message: string, originalCause?: unknown) {
        super(message);

        this.name = "GoogleSheetsError";
        this.code = code;
        this.originalCause = originalCause;
    }
}

export class GoogleSheetsConfigurationError extends GoogleSheetsError {
    constructor(message: string) {
        super("GOOGLE_SHEETS_CONFIGURATION_ERROR", message);
        this.name = "GoogleSheeysConfigurationError";
    }
}

export class GoogleSheetsAuthenticationError extends GoogleSheetsError {
    constructor(message: string, originalCause?: unknown) {
        super("GOOGLE_SHEETS_AUTHENTICATION_ERROR", message, originalCause);
        this.name = "GoogleSheetsAuthenticationError";
    }
}

export class GoogleSheetsReadError extends GoogleSheetsError {
    constructor(message: string, originalCause?: unknown) {
        super("GOOGLE_SHEETS_READ_ERROR", message, originalCause);
        this.name = "GoogleSheetsReadError";
    }
}

export class GoogleSheetsMappingError extends GoogleSheetsError {
    constructor(message: string, originalCause?: unknown) {
        super("GOOGLE_SHEETS_MAPPING_ERROR", message, originalCause);
        this.name = "GoogleSheetsMappingError";
    }
}
