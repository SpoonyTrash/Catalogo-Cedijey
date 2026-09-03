import { Brand } from "./brand";

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

export function SiteHeader() {
    return (
        <header className="relative z-10 mx-auto flex h-24 max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <a href="#inicio" aria-label="CEDIJEY, inicio">
                <Brand compact />
            </a>

            <nav
                aria-label="Navegación principal"
                className="hidden items-center gap-12 text-sm md:flex"
            >
                <a
                    href="#catalogo"
                    className="border-b border-[#171614] pb-2 font-semibold text-[#171614]"
                >
                    Catálogo
                </a>
                <a
                    href="#contacto"
                    className="pb-2 text-stone-700 transition-colors hover:text-[#171614]"
                >
                    Contacto
                </a>
            </nav>

            <a
                href="#catalog-search"
                className="grid size-11 place-items-center rounded-full text-[#171614] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label="Buscar en el catálogo"
            >
                <SearchIcon />
            </a>
        </header>
    );
}
