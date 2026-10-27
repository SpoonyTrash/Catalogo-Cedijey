import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const configSource = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

test("autoriza imágenes Cloudinary de ambas cuentas usadas en CATÁLOGO", () => {
    assert.match(configSource, /pathname:\s*["']\/im1hqc5v\/image\/upload\/\*\*["']/);
    assert.match(configSource, /pathname:\s*["']\/jywvgglr\/image\/upload\/\*\*["']/);
    assert.match(configSource, /hostname:\s*["']res\.cloudinary\.com["']/);
});
