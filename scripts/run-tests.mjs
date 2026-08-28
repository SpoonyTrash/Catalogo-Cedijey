import { spawnSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const typeScriptCli = fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url));
const compiledOutputDirectory = fileURLToPath(new URL("../.test-dist/", import.meta.url));

rmSync(compiledOutputDirectory, { recursive: true, force: true });

const compileResult = spawnSync(process.execPath, [typeScriptCli, "-p", "tsconfig.test.json"], {
    cwd: projectRoot,
    stdio: "inherit",
});

if (compileResult.status !== 0) {
    process.exitCode = compileResult.status ?? 1;
} else {
    const compiledTestsDirectory = join(compiledOutputDirectory, "tests");
    const compiledTests = readdirSync(compiledTestsDirectory)
        .filter((fileName) => fileName.endsWith(".test.js"))
        .sort()
        .map((fileName) => `.test-dist/tests/${fileName}`);

    const testResult = spawnSync(
        process.execPath,
        ["--conditions=react-server", "--test", ...compiledTests],
        {
            cwd: projectRoot,
            stdio: "inherit",
        },
    );

    process.exitCode = testResult.status ?? 1;
}
