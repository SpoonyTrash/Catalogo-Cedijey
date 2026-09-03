import Image from "next/image";

type BrandProps = Readonly<{
    compact?: boolean;
}>;

export function Brand({ compact = false }: BrandProps) {
    return (
        <span
            className={
                compact
                    ? "relative block h-[38px] w-[150px] overflow-hidden"
                    : "relative block h-[61px] w-[240px] overflow-hidden sm:h-[66px] sm:w-[260px]"
            }
        >
            <Image
                src="/cedijey-logo.png"
                alt="CEDIJEY"
                width={625}
                height={279}
                className={
                    compact
                        ? "absolute -top-[24px] -left-[24px] h-auto w-[189px] max-w-none mix-blend-multiply"
                        : "absolute -top-[38px] -left-[39px] h-auto w-[302px] max-w-none mix-blend-multiply sm:-top-[41px] sm:-left-[42px] sm:w-[328px]"
                }
            />
        </span>
    );
}
