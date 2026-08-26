"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

type ErrorPageProps = Readonly<{
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error("[route-error]", {
            message: error.message,
            digest: error.digest,
        });
    }, [error]);

    return (
        <ErrorState
            title="No pudimos cargar el inventario"
            message="Ocurrió un problema al consultar los productos. Intenta nuevamente."
            reference={error.digest}
            onRetry={reset}
        />
    );
}
