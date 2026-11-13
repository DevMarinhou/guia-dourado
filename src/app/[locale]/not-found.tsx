import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NaoEncontrado() {
  const t = useTranslations('naoEncontrado');
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p>{t('texto')}</p>
      <Link href="/" className="alvo inline-flex items-center underline">
        {t('voltar')}
      </Link>
    </div>
  );
}
