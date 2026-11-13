import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';
import type { Idioma } from '@/dominio/tipos';
import { frasesProntas } from '@/lib/dados';

// T06: Conversar (RF-14 a RF-17). Frases prontas já disponíveis (offline); falta a tela dividida
// com legenda ao vivo (ProvedorEscuta), "digite e fale" (ProvedorFala) e a cascata de tradução.
export default async function PaginaConversar({ params }: PageProps<'/[locale]/conversar'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T06');
  const idioma = locale as Idioma;

  return (
    <TelaEmConstrucao id="T06" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-14', 'RF-15', 'RF-16', 'RF-17']}>
      {frasesProntas.map((g) => (
        <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
          <h2 id={`grupo-${g.id}`} className="mb-2 text-xl font-bold">
            {g.nome[idioma]}
          </h2>
          <ul className="space-y-2">
            {g.frases.map((f) => (
              <li key={f.id} className="rounded-lg border border-borda p-3">
                {f[idioma]}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </TelaEmConstrucao>
  );
}
