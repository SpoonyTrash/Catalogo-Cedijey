import Image from "next/image";

import { isProductSoldOut } from "@/lib/products/is-product-sold-out";
import type { Product } from "@/types/product";

type ProductCardProps = Readonly<{
    product: Product;
}>;

export function ProductCard({ product }: ProductCardProps) {
    const isSoldOut = isProductSoldOut(product.status);

    return (
        <article
            className={
                isSoldOut
                    ? "group flex min-h-full flex-col overflow-hidden rounded-[22px] border border-stone-300 bg-stone-50"
                    : "group flex min-h-full flex-col overflow-hidden rounded-[22px] border border-stone-300 bg-white"
            }
            data-sku={product.sku}
            data-sold-out={isSoldOut || undefined}
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <div className={isSoldOut ? "h-full opacity-45 grayscale" : "h-full"}>
                    {product.coverImageUrl ? (
                        <Image
                            src={product.coverImageUrl}
                            alt={`Portada de ${product.album} de ${product.artist}`}
                            fill
                            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-stone-500">
                            Portada no disponible
                        </div>
                    )}
                </div>

                {isSoldOut ? (
                    <div className="absolute inset-x-4 top-4 flex items-start justify-between">
                        <span
                            className="grid size-9 place-items-center rounded-lg border-2 border-stone-600 bg-white/80 text-xl leading-none text-stone-700 shadow-sm backdrop-blur-sm"
                            aria-label="Producto agotado"
                        >
                            ☹
                        </span>
                        <span className="rounded-lg bg-stone-700/80 px-3 py-2 text-xs font-bold tracking-wide text-white shadow-sm backdrop-blur-sm">
                            AGOTADO
                        </span>
                    </div>
                ) : null}
            </div>

            <div
                className={
                    isSoldOut ? "flex flex-1 flex-col p-5 opacity-55" : "flex flex-1 flex-col p-5"
                }
            >
                <h2 className="line-clamp-2 text-lg leading-snug font-medium tracking-[-0.02em] text-[#171614]">
                    {product.album}
                </h2>
                <p className="mt-1 line-clamp-1 text-xs tracking-wide text-stone-500 uppercase">
                    {product.artist}
                </p>
                <p className="mt-3.5 text-xs tracking-wide text-stone-500 uppercase">
                    {product.genre}
                </p>

                <span
                    className={
                        isSoldOut
                            ? "mt-4 flex h-11 items-center justify-between rounded-full border border-stone-300 bg-stone-100 px-4 text-sm text-stone-600"
                            : "mt-4 flex h-11 items-center justify-between rounded-full border border-stone-300 px-4 text-sm text-[#171614] transition-colors group-hover:border-stone-500"
                    }
                >
                    {isSoldOut ? "Agotado" : "Ver producto"}
                    <span className="text-lg" aria-hidden="true">
                        →
                    </span>
                </span>
            </div>
        </article>
    );
}
