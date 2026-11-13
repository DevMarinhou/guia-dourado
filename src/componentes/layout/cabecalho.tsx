import { getLocale, getTranslations } from 'next-intl/server';
import { BotaoLibras } from '@/componentes/a11y/botao-libras';
import { BotaoOuvir } from '@/componentes/a11y/botao-ouvir';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const ROTULO_IDIOMA: Record<string, { curto: string; nome: string }> = {
  'pt-BR': { curto: 'PT', nome: 'Português' },
  en: { curto: 'EN', nome: 'English' },
  es: { curto: 'ES', nome: 'Español' },
};

export async function Cabecalho() {
  const t = await getTranslations('comum');
  const atual = await getLocale();
  return (
    <header className="border-b border-borda bg-superficie">
      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link href="/" className="alvo inline-flex items-center font-bold text-primaria">
          {t('nomeApp')}
        </Link>
        <nav aria-label={t('idioma')} className="flex gap-1">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              lang={l}
              aria-current={l === atual ? 'true' : undefined}
              className="alvo inline-flex items-center justify-center rounded border border-borda px-2 text-sm aria-[current]:bg-primaria aria-[current]:text-primaria-texto"
            >
              <span aria-hidden="true">{ROTULO_IDIOMA[l]?.curto}</span>
              <span className="sr-only">{ROTULO_IDIOMA[l]?.nome}</span>
            </Link>
          ))}
        </nav>
        <div className="flex gap-1">
          <BotaoOuvir rotulo={t('ouvir')} />
          <BotaoLibras rotulo={t('libras')} />
        </div>
      </div>
    </header>
  );
}
