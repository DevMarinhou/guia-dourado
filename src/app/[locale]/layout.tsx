import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible_Next } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AnunciadorProvider } from '@/componentes/a11y/anunciador';
import { BotaoAjuda } from '@/componentes/layout/botao-ajuda';
import { Cabecalho } from '@/componentes/layout/cabecalho';
import { Rodape } from '@/componentes/layout/rodape';
import { scriptPreferencias } from '@/funcionalidades/preferencias/script-preferencias';
import { routing } from '@/i18n/routing';
import '../globals.css';

// Fonte do Braille Institute, desenhada para baixa visão (ADR-0010).
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ['latin'], variable: '--fonte-atkinson', display: 'swap' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'inicio' });
  return {
    title: { default: 'Guia Dourado', template: '%s · Guia Dourado' },
    description: t('subtitulo'),
  };
}

export const viewport: Viewport = {
  themeColor: '#0b4f8a',
  // Sem maximum-scale: o usuário sempre pode dar zoom (WCAG 1.4.4).
};

export default async function LayoutVisitante({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('comum');

  return (
    <html lang={locale} className={atkinson.variable} suppressHydrationWarning>
      <head>
        {/* Aplica tema, fonte e movimento antes da primeira pintura (sem "piscar"). */}
        <script dangerouslySetInnerHTML={{ __html: scriptPreferencias }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-fundo text-texto">
        <a href="#conteudo" className="pular-link">
          {t('pularConteudo')}
        </a>
        <NextIntlClientProvider>
          <AnunciadorProvider>
            <Cabecalho />
            <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4">
              {children}
            </main>
            <Rodape />
            <BotaoAjuda />
          </AnunciadorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
