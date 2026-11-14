import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaPrancha } from '@/funcionalidades/prancha/tela-prancha';
import type { Idioma } from '@/dominio/tipos';
import { prancha } from '@/lib/dados';

// T07: Prancha de comunicação (RF-18). Client Component: tocar num pictograma fala
// a frase e abre em tela cheia; modo "Montar frase" junta 2 a 3 pictogramas; as
// ações dos itens levam à T05 (rota) e à T08 (pedir ajuda).
export async function generateMetadata({ params }: PageProps<'/[locale]/prancha'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T07' });
  return { title: t('titulo') };
}

async function Conteudo({ params }: { params: PageProps<'/[locale]/prancha'>['params'] }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T07');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <TelaPrancha categorias={prancha} idioma={locale as Idioma} />
    </>
  );
}

export default function PaginaPrancha({ params }: PageProps<'/[locale]/prancha'>) {
  return (
    <div className="space-y-4">
      {/* params dentro de <Suspense>: navegação instantânea (Next.js 16, como em ajuda/[id]). */}
      <Suspense fallback={null}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
