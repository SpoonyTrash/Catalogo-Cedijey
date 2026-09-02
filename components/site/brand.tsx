type BrandProps = Readonly<{
    compact?: boolean;
}>;

export function Brand({ compact = false }: BrandProps) {
    return (
        <span className="inline-flex items-center gap-3 text-[#171614]">
            <span
                className={
                    compact
                        ? "relative grid size-8 place-items-center rounded-[7px] border-[3px] border-current"
                        : "relative grid size-14 place-items-center rounded-[13px] border-[5px] border-current"
                }
                aria-hidden="true"
            >
                <span
                    className={
                        compact
                            ? "size-4 rounded-[3px] border-[3px] border-current"
                            : "size-7 rounded-[6px] border-[5px] border-current"
                    }
                />
            </span>
            <span className="flex flex-col">
                <span
                    className={
                        compact
                            ? "text-xl leading-none font-bold tracking-[-0.04em]"
                            : "text-4xl leading-none font-bold tracking-[-0.05em]"
                    }
                >
                    MiniÁlbum
                </span>
                <span
                    className={
                        compact
                            ? "mt-1 text-[7px] font-bold tracking-[0.3em] uppercase"
                            : "mt-2 text-xs font-bold tracking-[0.32em] uppercase"
                    }
                >
                    Keychains
                </span>
            </span>
        </span>
    );
}
