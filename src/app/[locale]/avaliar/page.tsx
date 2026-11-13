import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';

// T10: Avaliar / reportar barreira (RF-24). Server Action + useActionState; funciona sem JavaScript.
export async function generateMetadata({ params }: PageProps<'/[locale]/avaliar'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T10' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/avaliar'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T10');
  return <TelaEmConstrucao id="T10" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-24']} />;
}
