import Image from "next/image";

import type { Product } from "@/types/product";

type ProductCardProps = Readonly<{
    product: Product;
}>;

export function ProductCard({ product }: ProductCardProps) {
    const status = product.status.trim() || "Estado no disponible";
    const isSoldOut = status.toLocaleLowerCase("es-MX") === "agotado";

    return (
        <article
            className={
                isSoldOut
                    ? "group flex min-h-full flex-col overflow-hidden rounded-[22px] border border-stone-300 bg-white opacity-[0.58] grayscale-[18%]"
                    : "group flex min-h-full flex-col overflow-hidden rounded-[22px] border border-stone-300 bg-white"
            }
            data-sku={product.sku}
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
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

                {isSoldOut ? (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-stone-800 shadow-sm backdrop-blur-sm">
                        <span aria-hidden="true">☹</span>
                        Agotado
                    </span>
                ) : null}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h2 className="line-clamp-2 text-lg leading-snug font-medium tracking-[-0.02em] text-[#171614]">
                    {product.album}
                </h2>
                <p className="mt-1 line-clamp-1 text-xs tracking-wide text-stone-500 uppercase">
                    {product.artist}
                </p>
                <p className="mt-3.5 text-xs tracking-wide text-stone-500 uppercase">
                    {product.genre}
                </p>

                <span className="mt-4 flex h-11 items-center justify-between rounded-full border border-stone-300 px-4 text-sm text-[#171614] transition-colors group-hover:border-stone-500">
                    Ver producto
                    <span className="text-lg" aria-hidden="true">
                        →
                    </span>
                </span>
            </div>
        </article>
    );
}
