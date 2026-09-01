"use client";

import { ErrorState } from "@/components/ui/error-state";

type ErrorPageProps = Readonly<{
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <ErrorState
            title="No pudimos cargar el inventario"
            message="El servicio de inventario no está disponible temporalmente. Intenta nuevamente."
            reference={error.digest}
            onRetry={reset}
        />
    );
}
