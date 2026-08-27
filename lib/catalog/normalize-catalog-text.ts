const COMBINING_DIACRITICS_PATTERN = /[\u0300-\u036f]/g;
const CONSECUTIVE_WHITESPACE_PATTERN = /\s+/g;

/**
 * Produces a comparison key for catalog filters and searches without changing display text.
 */
export function normalizeCatalogText(value: string): string {
    return value
        .trim()
        .replace(CONSECUTIVE_WHITESPACE_PATTERN, " ")
        .normalize("NFD")
        .replace(COMBINING_DIACRITICS_PATTERN, "")
        .toLocaleLowerCase("es-MX");
}
