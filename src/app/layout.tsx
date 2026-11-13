import type { Metadata } from "next";
import "./globals.css";
import { PreferenciasProvider } from "@/components/PreferenciasProvider";

export const metadata: Metadata = {
  title: "Guia Dourado — Capim Dourado Shopping",
  description:
    "Acessibilidade e comunicação universal no Capim Dourado Shopping (Palmas/TO). Mapa, rotas acessíveis, voz, Libras e suporte.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Saltar para o conteúdo
        </a>
        <PreferenciasProvider>{children}</PreferenciasProvider>
      </body>
    </html>
  );
}
