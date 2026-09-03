import { Brand } from "./brand";

function InstagramGlyph() {
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
                            <a
                                href="https://www.instagram.com/cedijey/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="grid size-12 place-items-center rounded-full border border-stone-300 text-[#171614] transition-colors hover:border-stone-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
                                aria-label="CEDIJEY en Instagram"
                                title="Instagram"
                            >
                                <InstagramGlyph />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-stone-300 pt-8 text-sm text-stone-500">
                    © 2026 CEDIJEY. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
