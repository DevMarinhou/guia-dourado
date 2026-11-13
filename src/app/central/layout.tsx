import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Central da equipe', template: '%s · Central · Guia Dourado' },
  robots: { index: false, follow: false },
};

// T12: área interna da equipe (pt-BR). TODO(RF-22): login com Supabase Auth e papéis (RLS).
export default function LayoutCentral({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-fundo text-texto">
        <a href="#conteudo" className="pular-link">
          Pular para o conteúdo
        </a>
        <header className="border-b border-borda bg-superficie px-4 py-3 font-bold text-primaria">Central · Guia Dourado</header>
        <main id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
