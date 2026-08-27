import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const typeScriptCli = fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url));

const compileResult = spawnSync(process.execPath, [typeScriptCli, "-p", "tsconfig.test.json"], {
    cwd: projectRoot,
    stdio: "inherit",
});

if (compileResult.status !== 0) {
    process.exitCode = compileResult.status ?? 1;
} else {
    const compiledTestsDirectory = fileURLToPath(new URL("../.test-dist/tests/", import.meta.url));
    const compiledTests = readdirSync(compiledTestsDirectory)
        .filter((fileName) => fileName.endsWith(".test.js"))
        .sort()
        .map((fileName) => `.test-dist/tests/${fileName}`);

    const testResult = spawnSync(process.execPath, ["--test", ...compiledTests], {
        cwd: projectRoot,
        stdio: "inherit",
    });

    process.exitCode = testResult.status ?? 1;
}
