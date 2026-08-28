import { connection } from "next/server";

import { ProductGrid } from "@/components/inventory/product-grid";
import { inventoryService } from "@/lib/server/inventory";

export default async function HomePage() {
    await connection();

    const products = await inventoryService.getProducts();

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

                <ProductGrid products={products} />
            </div>
        </main>
    );
}
