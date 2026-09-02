import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
    title: "MiniÁlbum Keychains | Catálogo",
    description: "Catálogo de llaveros álbum para llevar tus recuerdos favoritos contigo.",
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
