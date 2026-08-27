import { spawnSync } from "node:child_process";
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
    const testResult = spawnSync(
        process.execPath,
        ["--test", ".test-dist/tests/google-sheets-request.test.js"],
        {
            cwd: projectRoot,
            stdio: "inherit",
        },
    );

    process.exitCode = testResult.status ?? 1;
}
