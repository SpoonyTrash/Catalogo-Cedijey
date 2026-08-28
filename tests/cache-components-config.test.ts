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

test("habilita Cache Components en Next.js 16", () => {
    assert.match(nextConfigSource, /cacheComponents:\s*true/);
});

test("mantiene una única función cacheada para todo el catálogo", () => {
    const sourceDirectories = ["app", "lib", "repositories", "services"];
    const cacheDirectiveFiles = sourceDirectories
        .flatMap((directory) => findTypeScriptFiles(join(projectRoot, directory)))
        .filter((filePath) => /["']use cache["']/.test(readFileSync(filePath, "utf8")))
        .map((filePath) => relative(projectRoot, filePath));

    assert.deepEqual(cacheDirectiveFiles, ["lib/server/inventory.ts"]);
});
