import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LeitorLetreiro } from '@/funcionalidades/letreiro/leitor-letreiro';
import { locais } from '@/lib/dados';

// Leitor de letreiro: aponte a câmera para a fachada e o celular fala a loja à frente.
// OCR no próprio aparelho (Tesseract.js); nenhuma imagem sai do celular.
export async function generateMetadata({ params }: PageProps<'/[locale]/letreiro'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.letreiro' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/letreiro'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.letreiro');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <LeitorLetreiro locais={locais} />
    </div>
  );
}
