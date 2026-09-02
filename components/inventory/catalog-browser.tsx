"use client";

import { useMemo, useState } from "react";

import { ProductGrid } from "@/components/inventory/product-grid";
import { getAvailableGenres } from "@/lib/catalog/genre-selectors";
import { getVisibleProducts } from "@/lib/catalog/get-visible-products";
import { normalizeCatalogText } from "@/lib/catalog/normalize-catalog-text";
import type { CatalogSortOrder } from "@/types/catalog";
import type { Product } from "@/types/product";

type CatalogBrowserProps = Readonly<{
    products: readonly Product[];
}>;

function GridIcon() {
    return (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" />
            <rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" />
            <rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" />
            <rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" />
        </svg>
    );
}

function GenreIcon() {
    return (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
            <path
                d="M10 16.2S3.8 12.7 3.8 7.8A3.3 3.3 0 0 1 10 6.2a3.3 3.3 0 0 1 6.2 1.6c0 4.9-6.2 8.4-6.2 8.4Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

export function CatalogBrowser({ products }: CatalogBrowserProps) {
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<CatalogSortOrder>("relevance");
    const [showAllGenres, setShowAllGenres] = useState(false);

    const genres = useMemo(() => getAvailableGenres(products), [products]);
    const genreCounts = useMemo(() => {
        const counts = new Map<string, number>();

        for (const product of products) {
            const key = normalizeCatalogText(product.genre);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        return counts;
    }, [products]);
    const result = useMemo(
        () =>
            getVisibleProducts(products, {
                selectedGenre,
                searchQuery,
                sortOrder,
            }),
        [products, searchQuery, selectedGenre, sortOrder],
    );

    const visibleGenres = showAllGenres ? genres : genres.slice(0, 6);
    const categories: readonly (string | null)[] = [null, ...visibleGenres];
    const hiddenGenreCount = Math.max(0, genres.length - visibleGenres.length);

    return (
        <section id="catalogo" className="scroll-mt-4 bg-white">
            <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
                <div className="flex flex-col gap-7 border-b border-stone-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex items-baseline gap-8">
                        <h2 className="text-3xl font-medium tracking-[-0.04em]">Catálogo</h2>
                        <span className="text-sm text-stone-500">
                            {result.matchedProducts}{" "}
                            {result.matchedProducts === 1 ? "modelo" : "modelos"}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <label className="relative block min-w-0 sm:w-72">
                            <span className="sr-only">Buscar por álbum o artista</span>
                            <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-stone-500">
                                <SearchIcon />
                            </span>
                            <input
                                id="catalog-search"
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Buscar álbum o artista"
                                className="h-12 w-full rounded-full border border-stone-300 bg-white pr-4 pl-11 text-sm transition-colors outline-none placeholder:text-stone-400 focus:border-stone-700"
                            />
                        </label>

                        <label className="relative block sm:w-52">
                            <span className="sr-only">Ordenar catálogo</span>
                            <select
                                value={sortOrder}
                                onChange={(event) =>
                                    setSortOrder(event.target.value as CatalogSortOrder)
                                }
                                className="h-12 w-full appearance-none rounded-full border border-stone-300 bg-white px-5 pr-10 text-sm outline-none focus:border-stone-700"
                            >
                                <option value="relevance">Más populares</option>
                                <option value="alphabetical-asc">Álbum: A–Z</option>
                                <option value="alphabetical-desc">Álbum: Z–A</option>
                            </select>
                            <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-xs text-stone-500">
                                ▾
                            </span>
                        </label>
                    </div>
                </div>

                <div
                    className="mt-8 flex gap-2 overflow-x-auto pb-2 lg:hidden"
                    aria-label="Categorías"
                >
                    {categories.map((genre) => {
                        const isSelected = selectedGenre === genre;
                        const count =
                            genre === null
                                ? products.length
                                : (genreCounts.get(normalizeCatalogText(genre)) ?? 0);

                        return (
                            <button
                                key={genre ?? "all"}
                                type="button"
                                onClick={() => setSelectedGenre(genre)}
                                className={
                                    isSelected
                                        ? "shrink-0 rounded-full bg-[#171614] px-5 py-2.5 text-sm text-white"
                                        : "shrink-0 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm text-stone-700"
                                }
                                aria-pressed={isSelected}
                            >
                                {genre ?? "Todos"} · {count}
                            </button>
                        );
                    })}
                    {hiddenGenreCount > 0 ? (
                        <button
                            type="button"
                            onClick={() => setShowAllGenres(true)}
                            className="shrink-0 rounded-full border border-dashed border-stone-400 bg-white px-5 py-2.5 text-sm font-medium text-stone-700"
                        >
                            Ver todas · +{hiddenGenreCount}
                        </button>
                    ) : null}
                </div>

                <div className="mt-8 grid items-start gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
                    <aside className="hidden lg:block">
                        <div className="rounded-[22px] border border-stone-300 p-5">
                            <h3 className="mb-4 text-base font-medium">Categorías</h3>
                            <div className="space-y-1">
                                {categories.map((genre) => {
                                    const isSelected = selectedGenre === genre;
                                    const count =
                                        genre === null
                                            ? products.length
                                            : (genreCounts.get(normalizeCatalogText(genre)) ?? 0);

                                    return (
                                        <button
                                            key={genre ?? "all"}
                                            type="button"
                                            onClick={() => setSelectedGenre(genre)}
                                            className={
                                                isSelected
                                                    ? "flex w-full items-center gap-3 rounded-xl bg-[#f4f1ed] px-3 py-3 text-left text-[#171614]"
                                                    : "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-stone-700 transition-colors hover:bg-stone-50"
                                            }
                                            aria-pressed={isSelected}
                                        >
                                            {genre === null ? <GridIcon /> : <GenreIcon />}
                                            <span className="min-w-0 flex-1 truncate">
                                                {genre ?? "Todos"}
                                            </span>
                                            <span className="text-xs text-stone-400">{count}</span>
                                        </button>
                                    );
                                })}
                                {hiddenGenreCount > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllGenres(true)}
                                        className="mt-2 flex w-full items-center justify-between rounded-xl border border-dashed border-stone-300 px-3 py-3 text-left text-sm font-medium text-stone-700 transition-colors hover:border-stone-500 hover:bg-stone-50"
                                    >
                                        Ver todas
                                        <span className="text-xs text-stone-400">
                                            +{hiddenGenreCount}
                                        </span>
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-[22px] bg-[#f4f2ef]">
                            <div className="p-6">
                                <h3 className="text-2xl leading-[1.05] font-medium tracking-[-0.04em]">
                                    ¿Tienes tu
                                    <br />
                                    álbum favorito?
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-stone-600">
                                    Podemos convertirlo en un llavero único y personal.
                                </p>
                                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-sm">
                                    <span aria-hidden="true">✦</span>
                                    Personalizar
                                </span>
                            </div>
                            <div
                                className="h-40 bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url(https://res.cloudinary.com/im1hqc5v/image/upload/v1788310928/a8552df4-8580-4451-9432-c042c6e41b8c.png)",
                                }}
                                aria-hidden="true"
                            />
                        </div>
                    </aside>

                    <ProductGrid products={result.products} />
                </div>

                <div className="mt-10 rounded-[22px] bg-[#f4f2ef] p-6 lg:hidden">
                    <h3 className="text-2xl font-medium tracking-[-0.04em]">
                        ¿Tienes tu álbum favorito?
                    </h3>
                    <p className="mt-2 text-sm text-stone-600">
                        Podemos convertirlo en un llavero único y personal.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-sm">
                        <span aria-hidden="true">✦</span>
                        Personalizar
                    </span>
                </div>
            </div>
        </section>
    );
}
