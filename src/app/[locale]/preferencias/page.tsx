import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';

// T01: Preferências (RF-03). Salvar em localStorage (gd:preferencias:v1) e reaplicar via script-preferencias.
export async function generateMetadata({ params }: PageProps<'/[locale]/preferencias'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T01' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/preferencias'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T01');
  return <TelaEmConstrucao id="T01" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-03']} />;
}
