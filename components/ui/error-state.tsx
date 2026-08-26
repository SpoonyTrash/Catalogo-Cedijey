"use client";

type ErrorStateProps = Readonly<{
    title: string;
    message: string;
    reference?: string;
    onRetry?: () => void;
}>;

export function ErrorState({ title, message, reference, onRetry }: ErrorStateProps) {
    return (
        <main
            className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
            role="alert"
            aria-live="assertive"
        >
            <section className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-semibold tracking-wide text-red-600 uppercase">Error</p>

                <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>

                <p className="mt-3 text-sm text-slate-600">{message}</p>

                {reference ? (
                    <p className="mt-3 text-xs text-slate-500">Referencia: {reference}</p>
                ) : null}

                {onRetry ? (
                    <button
                        type="button"
                        className="mt-6 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                        onClick={onRetry}
                    >
                        Reintentar
                    </button>
                ) : null}
            </section>
        </main>
    );
}
