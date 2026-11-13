import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold">Local não encontrado</h1>
      <p className="mt-2 opacity-80">Verifica o link ou volta ao início.</p>
      <Link href="/" className="btn btn-primario mt-6">
        ← Início
      </Link>
    </main>
  );
}
