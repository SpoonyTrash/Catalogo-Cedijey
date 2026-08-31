/**
 * Invalida la caché del catálogo cuando se editan datos utilizados por la app.
 *
 * Este archivo debe copiarse a un proyecto de Apps Script vinculado al Sheet.
 * La URL y el secreto se configuran en Script Properties; nunca en este código.
 */

const CATALOG_REVALIDATION_CONFIG = Object.freeze({
    sheetName: "Productos",
    watchedColumns: Object.freeze([1, 2, 3, 7, 8, 12]),
    endpointProperty: "CATALOG_REVALIDATION_URL",
    secretProperty: "CATALOG_REVALIDATION_SECRET",
    lastSuccessProperty: "CATALOG_REVALIDATION_LAST_SUCCESS_AT",
    pendingProperty: "CATALOG_REVALIDATION_PENDING",
    editHandler: "handleCatalogEdit",
    flushHandler: "flushCatalogRevalidation",
    cooldownMilliseconds: 15 * 1000,
    lockTimeoutMilliseconds: 30 * 1000,
});

/**
 * Ejecuta esta función manualmente una sola vez para crear el trigger instalable.
 * Si ya existe, elimina duplicados y conserva únicamente uno.
 */
function installCatalogRevalidationTrigger() {
    getCatalogRevalidationCredentials_();

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (!spreadsheet) {
        throw new Error("Abre el proyecto de Apps Script desde el Google Sheet.");
    }

    const editTriggers = getTriggersForHandler_(CATALOG_REVALIDATION_CONFIG.editHandler);

    editTriggers.slice(1).forEach((trigger) => ScriptApp.deleteTrigger(trigger));

    if (editTriggers.length === 0) {
        ScriptApp.newTrigger(CATALOG_REVALIDATION_CONFIG.editHandler)
            .forSpreadsheet(spreadsheet)
            .onEdit()
            .create();
    }

    return "Trigger de invalidación del catálogo instalado.";
}

/**
 * Elimina los triggers y el estado interno, pero conserva URL y secreto.
 */
function removeCatalogRevalidationTriggers() {
    const handlerNames = [
        CATALOG_REVALIDATION_CONFIG.editHandler,
        CATALOG_REVALIDATION_CONFIG.flushHandler,
    ];

    ScriptApp.getProjectTriggers()
        .filter((trigger) => handlerNames.includes(trigger.getHandlerFunction()))
        .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

    const properties = PropertiesService.getScriptProperties();
    properties.deleteProperty(CATALOG_REVALIDATION_CONFIG.lastSuccessProperty);
    properties.deleteProperty(CATALOG_REVALIDATION_CONFIG.pendingProperty);

    return "Triggers de invalidación del catálogo eliminados.";
}

/**
 * Handler del trigger instalable de edición. No debe renombrarse a onEdit.
 */
function handleCatalogEdit(event) {
    if (!shouldInvalidateCatalog_(event)) {
        return;
    }

    queueCatalogRevalidation_();
}

/**
 * Envía una señal pendiente después de una ráfaga de ediciones.
 */
function flushCatalogRevalidation(event) {
    const lock = LockService.getScriptLock();
    lock.waitLock(CATALOG_REVALIDATION_CONFIG.lockTimeoutMilliseconds);

    try {
        deleteTriggerByUniqueId_(event && event.triggerUid);

        const properties = PropertiesService.getScriptProperties();

        if (properties.getProperty(CATALOG_REVALIDATION_CONFIG.pendingProperty) !== "true") {
            return;
        }

        const remainingCooldown = getRemainingCooldownMilliseconds_(properties);

        if (remainingCooldown > 0) {
            ensureFlushTrigger_(remainingCooldown);
            return;
        }

        try {
            requestCatalogRevalidation_();
            markRevalidationCompleted_(properties);
        } catch (error) {
            properties.deleteProperty(CATALOG_REVALIDATION_CONFIG.pendingProperty);
            throw error;
        }
    } finally {
        lock.releaseLock();
    }
}

/**
 * Prueba manual segura. Devuelve un mensaje, pero nunca el secreto ni productos.
 */
function testCatalogRevalidation() {
    queueCatalogRevalidation_();
    return "Solicitud de invalidación enviada o programada.";
}

function shouldInvalidateCatalog_(event) {
    if (!event || !event.range) {
        return false;
    }

    const range = event.range;

    if (range.getSheet().getName() !== CATALOG_REVALIDATION_CONFIG.sheetName) {
        return false;
    }

    const firstColumn = range.getColumn();
    const lastColumn = range.getLastColumn();

    return CATALOG_REVALIDATION_CONFIG.watchedColumns.some(
        (column) => column >= firstColumn && column <= lastColumn,
    );
}

function queueCatalogRevalidation_() {
    const lock = LockService.getScriptLock();
    lock.waitLock(CATALOG_REVALIDATION_CONFIG.lockTimeoutMilliseconds);

    try {
        const properties = PropertiesService.getScriptProperties();
        const remainingCooldown = getRemainingCooldownMilliseconds_(properties);

        if (remainingCooldown === 0) {
            requestCatalogRevalidation_();
            markRevalidationCompleted_(properties);
            deleteTriggersForHandler_(CATALOG_REVALIDATION_CONFIG.flushHandler);
            return;
        }

        properties.setProperty(CATALOG_REVALIDATION_CONFIG.pendingProperty, "true");
        ensureFlushTrigger_(remainingCooldown);
    } finally {
        lock.releaseLock();
    }
}

function requestCatalogRevalidation_() {
    const credentials = getCatalogRevalidationCredentials_();
    const response = UrlFetchApp.fetch(credentials.endpoint, {
        method: "post",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${credentials.secret}`,
        },
        followRedirects: false,
        muteHttpExceptions: true,
        payload: "",
    });
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
        throw new Error(`El endpoint de invalidación respondió con HTTP ${responseCode}.`);
    }
}

function getCatalogRevalidationCredentials_() {
    const properties = PropertiesService.getScriptProperties();
    const endpoint = (
        properties.getProperty(CATALOG_REVALIDATION_CONFIG.endpointProperty) || ""
    ).trim();
    const secret = properties.getProperty(CATALOG_REVALIDATION_CONFIG.secretProperty) || "";

    if (!/^https:\/\/[^?#]+\/api\/revalidate\/catalog\/?$/.test(endpoint)) {
        throw new Error(
            "CATALOG_REVALIDATION_URL debe ser una URL HTTPS sin query string y terminar en /api/revalidate/catalog.",
        );
    }

    if (secret.length < 32) {
        throw new Error("CATALOG_REVALIDATION_SECRET debe contener al menos 32 caracteres.");
    }

    return { endpoint, secret };
}

function getRemainingCooldownMilliseconds_(properties) {
    const lastSuccess = Number(
        properties.getProperty(CATALOG_REVALIDATION_CONFIG.lastSuccessProperty) || 0,
    );
    const elapsed = Date.now() - lastSuccess;

    return Math.max(0, CATALOG_REVALIDATION_CONFIG.cooldownMilliseconds - elapsed);
}

function markRevalidationCompleted_(properties) {
    properties.setProperty(CATALOG_REVALIDATION_CONFIG.lastSuccessProperty, String(Date.now()));
    properties.deleteProperty(CATALOG_REVALIDATION_CONFIG.pendingProperty);
}

function ensureFlushTrigger_(delayMilliseconds) {
    if (getTriggersForHandler_(CATALOG_REVALIDATION_CONFIG.flushHandler).length > 0) {
        return;
    }

    ScriptApp.newTrigger(CATALOG_REVALIDATION_CONFIG.flushHandler)
        .timeBased()
        .after(Math.max(1, Math.ceil(delayMilliseconds)))
        .create();
}

function deleteTriggerByUniqueId_(triggerUniqueId) {
    if (!triggerUniqueId) {
        return;
    }

    const matchingTrigger = ScriptApp.getProjectTriggers().find(
        (trigger) => trigger.getUniqueId() === String(triggerUniqueId),
    );

    if (matchingTrigger) {
        ScriptApp.deleteTrigger(matchingTrigger);
    }
}

function getTriggersForHandler_(handlerName) {
    return ScriptApp.getProjectTriggers().filter(
        (trigger) => trigger.getHandlerFunction() === handlerName,
    );
}

function deleteTriggersForHandler_(handlerName) {
    getTriggersForHandler_(handlerName).forEach((trigger) => ScriptApp.deleteTrigger(trigger));
}
