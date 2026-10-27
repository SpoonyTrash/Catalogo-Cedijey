import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import test from "node:test";
import {
    createServiceAccountAssertion,
    normalizePrivateKey,
    requestServiceAccountAccessToken,
} from "../lib/google/google-service-account-auth";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const credentials = { clientEmail: "test@project.iam.gserviceaccount.com", privateKey: pem };

test("firma un JWT RS256 verificable y contiene los claims de Google", async () => {
    const token = await createServiceAccountAssertion(credentials, 1800000000);
    const [header, payload, signature] = token.split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    assert.equal(JSON.parse(Buffer.from(header, "base64url").toString("utf8")).alg, "RS256");
    assert.equal(claims.iss, credentials.clientEmail);
    assert.equal(claims.aud, "https://oauth2.googleapis.com/token");
    assert.equal(claims.scope, "https://www.googleapis.com/auth/spreadsheets.readonly");
    assert.equal(claims.exp - claims.iat, 3600);
    assert.equal(verify("RSA-SHA256", Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, "base64url")), true);
});

test("permite claves con secuencias escapadas y comillas del entorno", async () => {
    assert.equal(normalizePrivateKey(`"${pem.replace(/\n/g, "\\n")}"`), pem.trim());
    assert.equal((await createServiceAccountAssertion({ ...credentials, privateKey: pem.replace(/\n/g, "\\n") })).split(".").length, 3);
});

test("solicita el token con JWT sin depender de googleapis", async () => {
    const fakeFetch: typeof fetch = async (url, options) => {
        assert.equal(url, "https://oauth2.googleapis.com/token");
        assert.equal(options?.method, "POST");
        const params = new URLSearchParams(String(options?.body));
        assert.equal(params.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
        assert.equal(params.get("assertion")?.split(".").length, 3);
        return Response.json({ access_token: "fake-token" });
    };
    assert.equal(await requestServiceAccountAccessToken(credentials, fakeFetch), "fake-token");
});

test("errores HTTP OAuth no exponen el cuerpo remoto", async () => {
    const fakeFetch: typeof fetch = async () => new Response("secret-error-body", { status: 401 });
    await assert.rejects(() => requestServiceAccountAccessToken(credentials, fakeFetch), (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.equal((err as Error & {status:number}).status, 401);
        assert.doesNotMatch(err.message, /secret-error-body/);
        return true;
    });
});
