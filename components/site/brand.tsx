import Image from "next/image";

type BrandProps = Readonly<{
    compact?: boolean;
}>;

export function Brand({ compact = false }: BrandProps) {
    return (
        <span className="inline-flex text-black">
            <Image
                src="/cedijey-logo.svg"
                alt="CEDIJEY"
                width={492}
                height={130}
                className={compact ? "h-auto w-[150px]" : "h-auto w-[240px] sm:w-[260px]"}
            />
        </span>
    );
}
