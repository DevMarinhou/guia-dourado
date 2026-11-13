import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/** Botão "Ajuda" fixo, sempre no mesmo lugar em todas as telas (WCAG 3.2.6). Abre T08 em 2 etapas. */
export async function BotaoAjuda() {
  const t = await getTranslations('comum');
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-fundo p-3">
      <Link
        href="/ajuda"
        className="alvo mx-auto flex max-w-2xl items-center justify-center rounded-lg bg-ajuda px-4 py-3 text-lg font-bold text-ajuda-texto"
      >
        <span aria-hidden="true">🆘&nbsp;</span>
        {t('ajuda')}
      </Link>
    </div>
  );
}
