import { Brand } from "./brand";

const SOCIAL_LABELS = ["Instagram", "TikTok", "X", "YouTube"] as const;

function SocialGlyph({ label }: Readonly<{ label: (typeof SOCIAL_LABELS)[number] }>) {
    if (label === "Instagram") {
        return (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                />
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
            </svg>
        );
    }

    if (label === "YouTube") {
        return <span className="ml-0.5 text-xl">▶</span>;
    }

    return <span className="text-xl font-semibold">{label === "TikTok" ? "♪" : "𝕏"}</span>;
}

export function SiteFooter() {
    return (
        <footer id="contacto" className="border-t border-stone-100 bg-[#f7f6f4]">
            <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
                <div className="grid gap-12 md:grid-cols-[1.25fr_0.7fr_1fr]">
                    <div>
                        <Brand />
                        <p className="mt-6 text-xl leading-relaxed text-stone-500">
                            Pequeños álbumes.
                            <br />
                            Grandes recuerdos.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">Explora</h2>
                        <a
                            href="#catalogo"
                            className="mt-8 inline-block border-b border-stone-500 pb-1 text-lg text-stone-500 hover:text-[#171614]"
                        >
                            Catálogo
                        </a>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">Síguenos</h2>
                        <div className="mt-7 flex flex-wrap gap-3" aria-label="Redes sociales">
                            {SOCIAL_LABELS.map((label) => (
                                <span
                                    key={label}
                                    className="grid size-12 place-items-center rounded-full border border-stone-300 text-[#171614]"
                                    title={label}
                                >
                                    <SocialGlyph label={label} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-stone-300 pt-8 text-sm text-stone-500">
                    © 2026 MiniÁlbum Keychains. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
