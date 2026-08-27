"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

import "./globals.css";

type GlobalErrorPageProps = Readonly<{
    error: Error & {
        digest?: string;
    };
    retry: () => void;
}>;

export default function GlobalErrorPage({ error, retry }: GlobalErrorPageProps) {
    useEffect(() => {
        console.error("[global-error]", {
            digest: error.digest,
        });
    }, [error]);

    return (
        <html lang="es-MX">
            <body>
                <ErrorState
                    title="No pudimos iniciar el catálogo"
                    message="El servicio no está disponible temporalmente. Intenta nuevamente."
                    reference={error.digest}
                    onRetry={retry}
                />
            </body>
        </html>
    );
}
