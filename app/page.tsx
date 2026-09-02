import { Suspense } from "react";
import { connection } from "next/server";

import { CatalogBrowser } from "@/components/inventory/catalog-browser";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getCachedCatalogProducts } from "@/lib/server/inventory";

const HERO_IMAGE_URL =
    "https://res.cloudinary.com/im1hqc5v/image/upload/v1788310928/a8552df4-8580-4451-9432-c042c6e41b8c.png";

async function CatalogProducts() {
    await connection();

    const products = await getCachedCatalogProducts();

    return <CatalogBrowser products={products} />;
}

function CatalogProductsFallback() {
    return (
        <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:px-10" role="status">
            <div className="h-8 w-52 animate-pulse rounded-full bg-stone-200" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 7 }, (_, index) => (
                    <div
                        key={index}
                        className="aspect-[4/5] animate-pulse rounded-[22px] bg-stone-100"
                    />
                ))}
            </div>
            <span className="sr-only">Cargando catálogo…</span>
        </section>
    );
}

export default function HomePage() {
    return (
        <main id="inicio" className="min-h-screen bg-white">
            <section
                className="relative min-h-[620px] overflow-hidden bg-[#f3eee8] bg-cover bg-[position:66%_center] sm:min-h-[680px] lg:min-h-[720px]"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgba(247, 243, 238, 0.98) 0%, rgba(247, 243, 238, 0.92) 31%, rgba(247, 243, 238, 0.28) 61%, rgba(247, 243, 238, 0.06) 100%), url(${HERO_IMAGE_URL})`,
                }}
            >
                <SiteHeader />

                <div className="relative mx-auto flex max-w-[1280px] px-5 pt-24 pb-20 sm:px-8 sm:pt-28 lg:px-10 lg:pt-32">
                    <div className="max-w-[620px]">
                        <p className="mb-5 text-xs font-semibold tracking-[0.22em] text-stone-600 uppercase">
                            Catálogo 2026
                        </p>
                        <h1 className="text-[clamp(3.25rem,6.2vw,6.4rem)] leading-[0.9] font-semibold tracking-[-0.065em] text-[#171614]">
                            Catálogo de
                            <br />
                            Llaveros Álbum
                        </h1>
                        <p className="mt-8 max-w-md text-lg leading-relaxed text-stone-700 sm:text-xl">
                            Pequeños álbumes que te acompañan a donde vayas.
                        </p>
                        <a
                            href="#catalogo"
                            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#171614] px-7 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171614]"
                        >
                            <span aria-hidden="true">✦</span>
                            Explora la colección
                        </a>
                    </div>
                </div>
            </section>

            <Suspense fallback={<CatalogProductsFallback />}>
                <CatalogProducts />
            </Suspense>

            <SiteFooter />
        </main>
    );
}
