import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const nextConfigSource = readFileSync(join(projectRoot, "next.config.ts"), "utf8");

function findTypeScriptFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            return findTypeScriptFiles(entryPath);
        }

        return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
    });
}

test("mantiene Cache Components deshabilitado para Workers", () => {
    assert.doesNotMatch(nextConfigSource.replace(/\/\/[^\n]*/g, ""), /cacheComponents:\s*true/);
});

test("mantiene una única función cacheada para todo el catálogo", () => {
    const sourceDirectories = ["app", "lib", "repositories", "services"];
    const cacheDirectiveFiles = sourceDirectories
        .flatMap((directory) => findTypeScriptFiles(join(projectRoot, directory)))
        .filter((filePath) => /["']use cache["']/.test(readFileSync(filePath, "utf8")))
        .map((filePath) => relative(projectRoot, filePath));

    assert.deepEqual(cacheDirectiveFiles, []);
    assert.match(readFileSync(join(projectRoot, "lib/server/inventory.ts"), "utf8"), /unstable_cache/);
});

test("mantiene filtros, búsqueda, ordenamiento y relacionados fuera de la caché del servidor", () => {
    const catalogSelectorSource = findTypeScriptFiles(join(projectRoot, "lib/catalog"))
        .map((filePath) => readFileSync(filePath, "utf8"))
        .join("\n");

    assert.doesNotMatch(catalogSelectorSource, /next\/cache/);
    assert.doesNotMatch(catalogSelectorSource, /server\/inventory/);
    assert.doesNotMatch(catalogSelectorSource, /GoogleSheets/);
    assert.doesNotMatch(catalogSelectorSource, /catalog-products/);
});
