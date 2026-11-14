import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FormularioPreferencias } from '@/funcionalidades/preferencias/formulario-preferencias';

// T01: Preferências (RF-03). Salva em localStorage (gd:preferencias:v1), aplica na hora
// (data-tema, --escala-fonte, data-movimento) e o script-preferencias reaplica antes da
// primeira pintura ao recarregar — sem "piscar" (CT-07).
export async function generateMetadata({ params }: PageProps<'/[locale]/preferencias'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T01' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/preferencias'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T01');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <FormularioPreferencias />
    </div>
  );
}
