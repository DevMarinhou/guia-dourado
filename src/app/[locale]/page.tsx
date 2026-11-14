import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CartaoLocalizacao } from '@/funcionalidades/localizacao/cartao-localizacao';
import { EscolhaComunicacao, type TextosEntrada } from '@/funcionalidades/entrada/escolha-comunicacao';
import { Link } from '@/i18n/navigation';
import type { Idioma } from '@/dominio/tipos';
import { pontos } from '@/lib/dados';

// T00: Início (RF-01, RF-02). Página estática; o ponto do QR é lido no cliente.
export default async function Inicio({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('inicio');
  const a = await getTranslations('atalhos');
  const e = await getTranslations('entrada');
  const chavesEntrada = [
    'titulo', 'toqueIniciar', 'f_pergunta', 'f_naoEntendi', 'ouvindo', 'falando', 'toqueRepetir', 'voceDisse',
    'voz', 'vozDesc', 'libras', 'librasDesc', 'cards', 'cardsDesc', 'abrindo', 'librasPronto', 'librasErro',
    'palavrasVoz', 'palavrasLibras', 'palavrasCards', 'gramatica', 'dica',
  ] as const satisfies readonly (keyof TextosEntrada)[];
  const textosEntrada = Object.fromEntries(chavesEntrada.map((k) => [k, e.raw(k) as string])) as TextosEntrada;
  const idioma = locale as Idioma;

  const nomesDosPontos = Object.fromEntries(
    pontos.filter((p) => p.ativo).map((p) => [p.codigo, p.nome[idioma] ?? p.nome['pt-BR']]),
  );

  const atalhos = [
    { href: '/guia', rotulo: a('guia'), icone: '📷' },
    { href: '/buscar', rotulo: a('buscar'), icone: '🔎' },
    { href: '/letreiro', rotulo: a('letreiro'), icone: '📷' },
    { href: '/mapa/terreo', rotulo: a('mapa'), icone: '🗺️' },
    { href: '/conversar', rotulo: a('conversar'), icone: '💬' },
    { href: '/prancha', rotulo: a('prancha'), icone: '🖼️' },
    { href: '/servicos', rotulo: a('servicos'), icone: '♿' },
    { href: '/preferencias', rotulo: a('preferencias'), icone: '⚙️' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primaria">{t('titulo')}</h1>
        <p className="text-texto-suave">{t('subtitulo')}</p>
      </div>

      {/* Porta de entrada: a pessoa diz ou toca como prefere se comunicar e abre a ferramenta certa. */}
      <EscolhaComunicacao textos={textosEntrada} idioma={locale} />

      <Suspense fallback={<p>{t('semLocal')}</p>}>
        <CartaoLocalizacao
          nomesDosPontos={nomesDosPontos}
          textos={{ voceEstaEm: t('voceEstaEm'), escolherLocal: t('escolherLocal'), semLocal: t('semLocal') }}
        />
      </Suspense>

      <nav aria-labelledby="o-que-fazer">
        <h2 id="o-que-fazer" className="mb-3 text-xl font-bold">
          {t('oQueFazer')}
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {atalhos.map((at) => (
            <li key={at.href}>
              <Link
                href={at.href}
                className="guia-atalho alvo flex h-full min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-borda bg-superficie p-3 text-center font-bold"
              >
                <span aria-hidden="true" className="text-3xl">
                  {at.icone}
                </span>
                {at.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
