import Link from "next/link";
import { LOCAIS } from "@/data/locais";
import { BarraAcessibilidade } from "@/components/BarraAcessibilidade";

export default function Inicio() {
  return (
    <>
      <BarraAcessibilidade />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6">
          <p className="text-sm font-bold" style={{ color: "var(--laranja)" }}>
            CAPIM DOURADO SHOPPING · PALMAS/TO
          </p>
          <h1 className="text-3xl font-extrabold leading-tight">
            Guia Dourado
          </h1>
          <p className="mt-1 opacity-80">
            Encontre, entenda, converse e peça ajuda — com acessibilidade.
          </p>
        </header>

        <nav aria-label="Atalhos principais" className="grid gap-3">
          <Link className="btn btn-primario" href="/mapa/terreo">
            🗺️ Mapa e rotas
          </Link>
          <Link className="btn" href="/buscar">
            🔎 Buscar lojas e cardápios
          </Link>
          <Link className="btn" href="/conversar">
            🗣️ Conversar (voz, Libras, idiomas)
          </Link>
          <Link
            className="btn"
            href="/ajuda"
            style={{ borderColor: "var(--vermelho)", color: "var(--vermelho)" }}
          >
            🆘 Pedir ajuda
          </Link>
        </nav>

        <section aria-labelledby="destaques" className="mt-8">
          <h2 id="destaques" className="mb-3 text-xl font-bold">
            Locais em destaque
          </h2>
          <ul className="grid gap-3">
            {LOCAIS.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/locais/${l.slug}`}
                  className="card block no-underline transition hover:shadow-lg"
                >
                  <strong>{l.nome}</strong>
                  <br />
                  <small>
                    {l.categoria} · {l.piso}
                  </small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
