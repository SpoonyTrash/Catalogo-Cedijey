import type { Product } from "@/types/product";

type ProductCardProps = Readonly<{
    product: Product;
}>;

export function ProductCard({ product }: ProductCardProps) {
    const status = product.status.trim() || "Estado no disponible";
    const isSoldOut = status.toLocaleLowerCase("es-MX") === "agotado";

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4" data-sku={product.sku}>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {product.genre}
            </p>

            <h2 className="mt-2 text-lg font-semibold text-slate-950">{product.album}</h2>

            <p className="text-sm text-slate-600">{product.artist}</p>

            <span
                className={
                    isSoldOut
                        ? "mt-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                        : "mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                }
            >
                {status}
            </span>
        </article>
    );
}
