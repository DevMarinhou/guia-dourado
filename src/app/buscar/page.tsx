import Link from "next/link";
import { LOCAIS } from "@/data/locais";
import { BarraAcessibilidade } from "@/components/BarraAcessibilidade";

export default function Buscar() {
  return (
    <>
      <BarraAcessibilidade />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/" className="btn btn-fantasma mb-4">
          ← Início
        </Link>
        <h1 className="mb-4 text-2xl font-extrabold">🔎 Buscar</h1>

        <form role="search" className="mb-6">
          <label htmlFor="q" className="mb-1 block font-bold">
            Nome da loja, quiosque ou serviço
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Ex.: Outback, C&A, praça…"
            className="w-full rounded-lg border-2 p-3 text-lg"
            style={{ borderColor: "var(--azul)", minHeight: 48 }}
          />
        </form>

        <ul className="grid gap-3" role="list">
          {LOCAIS.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/locais/${l.slug}`}
                className="card block no-underline hover:shadow-lg"
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
      </main>
    </>
  );
}
