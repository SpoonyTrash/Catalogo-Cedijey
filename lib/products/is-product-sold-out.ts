const SOLD_OUT_STATUSES = new Set([
    "agotado",
    "agotada",
    "agotados",
    "agotadas",
    "sin stock",
    "no disponible",
    "fuera de stock",
]);

function normalizeStatus(status: string): string {
    return status
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .toLocaleLowerCase("es-MX")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

export function isProductSoldOut(status: string): boolean {
    return SOLD_OUT_STATUSES.has(normalizeStatus(status));
}
