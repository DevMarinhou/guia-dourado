import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Idioma } from '@/dominio/tipos';
import { TelaRota } from '@/funcionalidades/rotas/tela-rota';
import { grafo, locais, pontos } from '@/lib/dados';

// T05: Rota (RF-11 a RF-13). Client Component: lê ?de=&para=, a origem em
// sessionStorage['gd:ponto'], consulta /api/equipamentos (timeout de 2 s), calcula com
// calcularRota() e gera os passos com gerarInstrucoes() — texto, voz e vibração.
// A leitura de params fica dentro de <Suspense> (padrão do Next.js 16, como em ajuda/[id]).
export async function generateMetadata({ params }: PageProps<'/[locale]/rota'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T05' });
  return { title: t('titulo') };
}

async function Conteudo({ params }: { params: PageProps<'/[locale]/rota'>['params'] }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T05');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <TelaRota grafo={grafo} pontos={pontos} locais={locais} idioma={locale as Idioma} />
    </>
  );
}

export default function Pagina({ params }: PageProps<'/[locale]/rota'>) {
  return (
    <div className="space-y-4">
      {/* fallback vazio: o texto de carregamento ficaria fora do Suspense (aviso do Next 16). */}
      <Suspense fallback={null}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
