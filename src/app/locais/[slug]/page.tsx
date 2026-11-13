import Link from "next/link";
import { notFound } from "next/navigation";
import { acharLocal } from "@/data/locais";
import { BarraAcessibilidade } from "@/components/BarraAcessibilidade";
import { DetalheLocal } from "@/components/DetalheLocal";

export function generateStaticParams() {
  return [{ slug: "outback" }, { slug: "mcdonalds" }, { slug: "ca" }, { slug: "praca-alimentacao" }];
}

export default async function PaginaLocal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const local = acharLocal(slug);
  if (!local) notFound();

  return (
    <>
      <BarraAcessibilidade />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/buscar" className="btn btn-fantasma mb-4">
          ← Voltar
        </Link>
        <DetalheLocal local={local} />
      </main>
    </>
  );
}
