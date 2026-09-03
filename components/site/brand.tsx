type BrandProps = Readonly<{
    compact?: boolean;
}>;

export function Brand({ compact = false }: BrandProps) {
    return (
        <span
            className={
                compact
                    ? "brand-wordmark text-[2rem]"
                    : "brand-wordmark text-[3.5rem] sm:text-[4rem]"
            }
            aria-label="CEDIJEY"
        >
            CEDIJEY
        </span>
    );
}
