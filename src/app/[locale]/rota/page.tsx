import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';

// T05: Rota (RF-11 a RF-13). Client Component: lê ?de=&para=, carrega o grafo, consulta /api/equipamentos, calcula com calcularRota() e gera passos com gerarInstrucoes().
export async function generateMetadata({ params }: PageProps<'/[locale]/rota'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T05' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/rota'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T05');
  return <TelaEmConstrucao id="T05" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-11', 'RF-12', 'RF-13']} />;
}
