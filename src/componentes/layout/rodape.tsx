import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function Rodape() {
  const t = await getTranslations('comum');
  return (
    <footer className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 text-sm text-texto-suave">
      <nav aria-label="Rodapé" className="flex flex-wrap gap-4">
        <Link className="alvo inline-flex items-center underline" href="/acessibilidade">
          {t('acessibilidade')}
        </Link>
        <Link className="alvo inline-flex items-center underline" href="/privacidade">
          {t('privacidade')}
        </Link>
      </nav>
      <p className="mt-2">{t('versaoDados')}</p>
    </footer>
  );
}
