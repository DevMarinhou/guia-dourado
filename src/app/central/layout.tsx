import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { AnunciadorProvider } from '@/componentes/a11y/anunciador';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Central da equipe', template: '%s · Central · Guia Dourado' },
  robots: { index: false, follow: false },
};

// T12: área interna da equipe (pt-BR). Login real = Supabase Auth + RLS (ADR-0008);
// enquanto não há credenciais, a fila usa o modo demonstração e a chave CENTRAL_CHAVE.
export default async function LayoutCentral({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('comum');
  const messages = await getMessages();

  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-fundo text-texto">
        <a href="#conteudo" className="pular-link">
          {t('pularConteudo')}
        </a>
        <NextIntlClientProvider messages={messages}>
          <AnunciadorProvider>
            <header className="border-b border-borda bg-superficie px-4 py-3 font-bold text-primaria">Central · Guia Dourado</header>
            <main id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl p-4">
              {children}
            </main>
          </AnunciadorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
