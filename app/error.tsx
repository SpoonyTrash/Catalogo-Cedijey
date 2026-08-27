"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

type ErrorPageProps = Readonly<{
    error: Error & {
        digest?: string;
    };
    retry: () => void;
}>;

export default function ErrorPage({ error, retry }: ErrorPageProps) {
    useEffect(() => {
        console.error("[route-error]", {
            digest: error.digest,
        });
    }, [error]);

    return (
        <ErrorState
            title="No pudimos cargar el inventario"
            message="El servicio de inventario no está disponible temporalmente. Intenta nuevamente."
            reference={error.digest}
            onRetry={retry}
        />
    );
}
