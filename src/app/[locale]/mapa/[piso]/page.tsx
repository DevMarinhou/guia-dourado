import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import type { PisoId } from '@/dominio/tipos';
import { locais, pisosPublicos } from '@/lib/dados';

// T02: Mapa por piso. Por enquanto, a ALTERNATIVA EM LISTA (RF-08), que é obrigatória.
// TODO(RF-07): MapaDoPiso (SVG da planta + marcadores focáveis + zoom por botões) e camadas (RF-27).
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => pisosPublicos.map((piso) => ({ locale, piso })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/mapa/[piso]'>) {
  const { locale, piso } = await params;
  const t = await getTranslations({ locale, namespace: 'pisos' });
  return { title: pisosPublicos.includes(piso as PisoId) ? t(piso as 'terreo') : 'Mapa' };
}

export default async function PaginaMapa({ params }: PageProps<'/[locale]/mapa/[piso]'>) {
  const { locale, piso } = await params;
  setRequestLocale(locale);
  if (!pisosPublicos.includes(piso as PisoId)) notFound();
  const tp = await getTranslations('pisos');
  const doPiso = locais.filter((l) => l.pisoId === piso).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{tp(piso as 'terreo')}</h1>
      <nav aria-label="Pisos">
        <ul className="grid grid-cols-2 gap-2">
          {pisosPublicos.map((p) => (
            <li key={p}>
              <Link
                href={`/mapa/${p}`}
                aria-current={p === piso ? 'page' : undefined}
                className="alvo flex items-center justify-center rounded-lg border-2 border-borda p-2 text-center aria-[current=page]:bg-primaria aria-[current=page]:text-primaria-texto"
              >
                {tp(p as 'terreo')}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ul className="divide-y divide-borda rounded-lg border border-borda">
        {doPiso.map((l) => (
          <li key={l.id}>
            <Link href={`/locais/${l.slug}`} className="alvo flex flex-col p-3">
              <span className="font-bold">{l.nome}</span>
              <span className="text-sm text-texto-suave">{l.numero}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
