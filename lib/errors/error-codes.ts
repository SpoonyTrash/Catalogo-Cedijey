export const APP_ERROR_CODES = [
    "UNKNOWN_ERROR",
    "REPOSITORY_ERROR",
    "INVENTORY_UNAVAILABLE",
    "INVALID_INVENTORY_DATA",
    "CONFIGURATION_ERROR",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];
