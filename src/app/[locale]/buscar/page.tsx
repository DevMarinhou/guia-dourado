import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';

// T03: Buscar (RF-09). Usar buscarLocais() do domínio num Client Component; busca por voz via ProvedorEscuta.
export async function generateMetadata({ params }: PageProps<'/[locale]/buscar'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T03' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/buscar'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T03');
  return <TelaEmConstrucao id="T03" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-09']} />;
}
