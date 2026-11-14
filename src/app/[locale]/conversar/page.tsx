import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaConversar } from '@/funcionalidades/conversar/tela-conversar';
import type { Idioma } from '@/dominio/tipos';
import { frasesProntas } from '@/lib/dados';

// T06: Conversar (RF-14 a RF-17). Client Component: metade de cima girada 180°,
// legenda ao vivo por lado (ProvedorEscuta, sem gravação), "digite e o celular fala",
// frases prontas offline, tradução em cascata e atalho para intérprete de Libras.
// URL_INTERPRETE_LIBRAS só é lida aqui (servidor) e passada como prop — não vai ao cliente.
export async function generateMetadata({ params }: PageProps<'/[locale]/conversar'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T06' });
  return { title: t('titulo') };
}

async function Conteudo({ params }: { params: PageProps<'/[locale]/conversar'>['params'] }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T06');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <TelaConversar
        frases={frasesProntas}
        idioma={locale as Idioma}
        urlInterprete={process.env.URL_INTERPRETE_LIBRAS ?? ''}
      />
    </>
  );
}

export default function PaginaConversar({ params }: PageProps<'/[locale]/conversar'>) {
  return (
    <div className="space-y-4">
      {/* params dentro de <Suspense>: navegação instantânea (Next.js 16, como em ajuda/[id]). */}
      <Suspense fallback={null}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
