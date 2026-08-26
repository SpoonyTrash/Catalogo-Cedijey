import { ProductCard } from "@/components/inventory/product-card";
import type { Product } from "@/types/product";

type ProductGridProps = Readonly<{
    products: readonly Product[];
}>;

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
                No hay productos para mostrar.
            </p>
        );
    }

    return (
        <section aria-label="Productos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
            ))}
        </section>
    );
}
