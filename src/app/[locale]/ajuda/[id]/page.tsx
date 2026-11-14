import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaAcompanhar } from '@/funcionalidades/ajuda/tela-acompanhar';

// T09: Acompanhar pedido (RF-21). id e token vêm da URL (?token=), lidos em tempo de
// execução — por isso params/searchParams ficam dentro de <Suspense> (Next.js 16).
export async function generateMetadata({ params }: PageProps<'/[locale]/ajuda/[id]'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T09' });
  return { title: t('titulo') };
}

async function Conteudo({ params, searchParams }: { params: PageProps<'/[locale]/ajuda/[id]'>['params']; searchParams: PageProps<'/[locale]/ajuda/[id]'>['searchParams'] }) {
  const { locale, id } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'telas.T09' });
  const tokenStr = typeof token === 'string' ? token : '';

  return (
    <>
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <TelaAcompanhar id={id} token={tokenStr} />
    </>
  );
}

export default function PaginaPedido({ params, searchParams }: PageProps<'/[locale]/ajuda/[id]'>) {
  return (
    <div className="space-y-4">
      <Suspense fallback={null}>
        <Conteudo params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
