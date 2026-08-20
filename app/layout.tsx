import type { ReactNode } from "react";
import "./globals.css";

type RootLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="es-MX">
            <body>{children}</body>
        </html>
    );
}
