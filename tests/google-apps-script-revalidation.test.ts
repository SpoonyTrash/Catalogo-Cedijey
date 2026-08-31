import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const scriptPath = join(process.cwd(), "google-apps-script/catalog-revalidation.gs");
const script = readFileSync(scriptPath, "utf8");

test("the Apps Script creates an authorized installable edit trigger", () => {
    assert.match(script, /ScriptApp\.newTrigger\(CATALOG_REVALIDATION_CONFIG\.editHandler\)/);
    assert.match(script, /\.forSpreadsheet\(spreadsheet\)\s*\.onEdit\(\)\s*\.create\(\)/);
    assert.doesNotMatch(script, /function\s+onEdit\s*\(/);
});

test("the Apps Script observes only the six catalog columns in Productos", () => {
    assert.match(script, /sheetName:\s*"Productos"/);
    assert.match(script, /watchedColumns:\s*Object\.freeze\(\[1, 2, 3, 7, 8, 12\]\)/);
    assert.match(script, /range\.getSheet\(\)\.getName\(\)/);
    assert.match(script, /range\.getLastColumn\(\)/);
});

test("the webhook reads its URL and secret from Script Properties", () => {
    assert.match(script, /PropertiesService\.getScriptProperties\(\)/);
    assert.match(script, /endpointProperty:\s*"CATALOG_REVALIDATION_URL"/);
    assert.match(script, /secretProperty:\s*"CATALOG_REVALIDATION_SECRET"/);
    assert.match(script, /Authorization:\s*`Bearer \$\{credentials\.secret\}`/);
    assert.match(script, /method:\s*"post"/);
    assert.match(script, /UrlFetchApp\.fetch\(credentials\.endpoint/);
    assert.doesNotMatch(script, /[?&](?:secret|token)=/i);
});

test("rapid edits are coalesced before reaching the protected endpoint", () => {
    assert.match(script, /cooldownMilliseconds:\s*15 \* 1000/);
    assert.match(script, /LockService\.getScriptLock\(\)/);
    assert.match(script, /pendingProperty:\s*"CATALOG_REVALIDATION_PENDING"/);
    assert.match(script, /ScriptApp\.newTrigger\(CATALOG_REVALIDATION_CONFIG\.flushHandler\)/);
    assert.match(script, /\.timeBased\(\)\s*\.after\(/);
});

test("the webhook does not log secrets, responses, or product data", () => {
    assert.doesNotMatch(script, /(?:console|Logger)\.(?:log|info|warn|error)/);
    assert.doesNotMatch(script, /getContentText\(/);
});
