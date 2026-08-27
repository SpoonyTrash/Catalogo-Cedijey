import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTypeScript,

    {
        files: ["components/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "googleapis",
                            message:
                                "Los componentes visuales no pueden acceder directamente a Google Sheets.",
                        },
                        {
                            name: "server-only",
                            message:
                                "Los componentes visuales deben recibir la información mediante props.",
                        },
                    ],
                    patterns: [
                        {
                            group: [
                                "@/repositories/**",
                                "@/services/**",
                                "@/lib/google/**",
                                "**/repositories/**",
                                "**/services/**",
                                "**/lib/google/**",
                            ],
                            message:
                                "La capa visual no puede importar módulos de acceso o procesamiento de datos.",
                        },
                    ],
                },
            ],
        },
    },

    {
        files: ["repositories/**/*.ts"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: [
                                "@/app/**",
                                "@/components/**",
                                "@/services/**",
                                "**/app/**",
                                "**/components/**",
                                "**/services/**",
                            ],
                            message:
                                "Los repositorios no pueden depender de páginas, componentes ni servicios.",
                        },
                    ],
                },
            ],
        },
    },

    {
        files: ["services/**/*.ts"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "googleapis",
                            message:
                                "Los servicios deben acceder a Google Sheets mediante un repositorio.",
                        },
                    ],
                    patterns: [
                        {
                            group: [
                                "@/app/**",
                                "@/components/**",
                                "@/lib/google/**",
                                "**/app/**",
                                "**/components/**",
                                "**/lib/google/**",
                            ],
                            message:
                                "Los servicios no pueden depender de páginas, componentes ni clientes de Google.",
                        },
                    ],
                },
            ],
            "no-restricted-globals": [
                "error",
                {
                    name: "fetch",
                    message:
                        "La capa de servicios debe acceder a fuentes externas mediante repositorios.",
                },
            ],
            "no-restricted-properties": [
                "error",
                {
                    object: "process",
                    property: "env",
                    message: "La capa de servicios no debe leer variables de entorno directamente.",
                },
            ],
        },
    },

    globalIgnores([
        ".next/**",
        ".test-dist/**",
        "out/**",
        "build/**",
        "coverage/**",
        "next-env.d.ts",
    ]),

    eslintConfigPrettier,
]);

export default eslintConfig;
