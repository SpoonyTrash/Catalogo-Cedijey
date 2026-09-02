import { ProductCard } from "@/components/inventory/product-card";
import type { Product } from "@/types/product";

type ProductGridProps = Readonly<{
    products: readonly Product[];
}>;

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="rounded-[22px] border border-dashed border-stone-300 px-6 py-20 text-center text-stone-600">
                <p className="text-lg font-medium text-[#171614]">No encontramos coincidencias</p>
                <p className="mt-2 text-sm">Prueba con otro artista, álbum o categoría.</p>
            </div>
        );
    }

    return (
        <section aria-label="Productos" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
            ))}
        </section>
    );
}
