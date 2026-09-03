import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
    title: "CEDIJEY | Cátalogo",
    description: "Catálogo de llaveros álbum de CEDIJEY.",
};

type RootLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="es-MX">
            <body className="antialiased">{children}</body>
        </html>
    );
}
