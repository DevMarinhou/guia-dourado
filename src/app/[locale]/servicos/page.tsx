import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';

// T11: Serviços acessíveis (RF-26). Lista com rota em 1 toque; conteúdo mantido pela equipe do shopping.
export async function generateMetadata({ params }: PageProps<'/[locale]/servicos'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T11' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/servicos'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T11');
  return <TelaEmConstrucao id="T11" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-26']} />;
}
