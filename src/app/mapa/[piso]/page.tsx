import Link from "next/link";
import { BarraAcessibilidade } from "@/components/BarraAcessibilidade";

const PISOS = [
  { slug: "terreo", nome: "1º Térreo" },
  { slug: "praca-alimentacao", nome: "2º Praça de Alimentação" },
];

export default async function Mapa({
  params,
}: {
  params: Promise<{ piso: string }>;
}) {
  const { piso } = await params;
  const atual = PISOS.find((p) => p.slug === piso) ?? PISOS[0];

  return (
    <>
      <BarraAcessibilidade />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/" className="btn btn-fantasma mb-4">
          ← Início
        </Link>
        <h1 className="mb-4 text-2xl font-extrabold">🗺️ Mapa — {atual.nome}</h1>

        <nav aria-label="Pavimentos" className="mb-4 flex gap-2">
          {PISOS.map((p) => (
            <Link
              key={p.slug}
              href={`/mapa/${p.slug}`}
              className="btn"
              aria-current={p.slug === atual.slug ? "page" : undefined}
              style={
                p.slug === atual.slug
                  ? { background: "var(--azul)", color: "#fff" }
                  : undefined
              }
            >
              {p.nome}
            </Link>
          ))}
        </nav>

        <div
          className="card relative overflow-hidden"
          style={{ minHeight: 320 }}
          role="img"
          aria-label={`Planta simplificada do pavimento ${atual.nome}. Versão textual disponível na lista abaixo.`}
        >
          {/* Planta simplificada (o grafo real entra na Fase 2) */}
          <div className="grid grid-cols-3 gap-2">
            {["C&A", "Riachuelo", "Marisa", "Escada", "Praça", "Elevador", "Sanit.", "Quiosques", "Entrada"].map(
              (nome) => (
                <div
                  key={nome}
                  className="flex min-h-16 items-center justify-center rounded border p-2 text-center text-sm font-bold"
                  style={{ borderColor: "var(--azul)", background: "var(--azul-claro)" }}
                >
                  {nome}
                </div>
              )
            )}
          </div>
          <p className="mt-3 text-sm opacity-70">
            Legenda: ▢ loja · ─ corredor · rota acessível a partir da busca.
          </p>
        </div>

        <h2 className="mb-2 mt-6 text-lg font-bold">Locais neste pavimento</h2>
        <ul className="grid gap-2">
          <li>
            <Link href="/locais/ca" className="btn">
              C&A — Loja 147
            </Link>
          </li>
          <li>
            <Link href="/locais/outback" className="btn">
              Outback — Loja 104
            </Link>
          </li>
        </ul>
      </main>
    </>
  );
}
