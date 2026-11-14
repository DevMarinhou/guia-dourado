import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locais } from '@/lib/dados';
import { BuscaLocais } from '@/funcionalidades/busca/busca-locais';

// T03: Buscar (RF-09). Client Component com buscarLocais() do domínio (locais vindos
// do servidor) e anúncio de "N resultados" via useAnunciador (CT-05).
export async function generateMetadata({ params }: PageProps<'/[locale]/buscar'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T03' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/buscar'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T03');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <BuscaLocais locais={locais} />
    </div>
  );
}
