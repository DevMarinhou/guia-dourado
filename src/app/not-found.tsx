import Link from 'next/link';
import './globals.css';

export default function NaoEncontradoGlobal() {
  return (
    <html lang="pt-BR">
      <body>
        <main id="conteudo" className="mx-auto max-w-xl p-6">
          <h1 className="text-2xl font-bold">Página não encontrada</h1>
          <p className="mt-2">Não encontramos esta página.</p>
          <p className="mt-4">
            <Link className="underline" href="/">
              Voltar ao início
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
