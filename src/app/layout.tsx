import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rifa",
  description: "Plataforma mobile-first para criacao e participacao em rifas.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
