import { Suspense } from "react";
import { connection } from "next/server";

import { ProductGrid } from "@/components/inventory/product-grid";
import { getCachedCatalogProducts } from "@/lib/server/inventory";

async function CatalogProducts() {
    await connection();

    const products = await getCachedCatalogProducts();

    return <ProductGrid products={products} />;
}

function CatalogProductsFallback() {
    return (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600" role="status">
            Cargando catálogo…
        </p>
    );
}

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8">
                    <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                        Verificación de tipos
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-950">
                        Inventario de llaveros
                    </h1>
                </header>

                <Suspense fallback={<CatalogProductsFallback />}>
                    <CatalogProducts />
                </Suspense>
            </div>
        </main>
    );
}
