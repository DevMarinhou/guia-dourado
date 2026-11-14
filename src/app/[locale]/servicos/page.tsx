import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Idioma } from '@/dominio/tipos';
import { equipamentos, locais, pontos } from '@/lib/dados';

// T11: Serviços acessíveis (RF-26). Lista com rota em 1 toque; conteúdo mantido
// pela equipe do shopping. Só o que existe em dados/*.json — o que não está
// informado aparece como "não informado" (nunca inventar dados de loja).
export async function generateMetadata({ params }: PageProps<'/[locale]/servicos'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T11' });
  return { title: t('titulo') };
}

export default async function Pagina({ params }: PageProps<'/[locale]/servicos'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T11');
  const ts = await getTranslations('servicos');
  const tl = await getTranslations('local');
  const tp = await getTranslations('pisos');
  const idioma = locale as Idioma;

  const sanitarios = locais.filter((l) => l.categoria === 'sanitario');
  const entradas = pontos.filter((p) => p.tipo === 'entrada' && p.ativo);
  // Serviços pedidos sem dado na planta: mostrados como "não informado".
  const semDado = [ts('fraldario'), ts('mesaReservada'), ts('areaTranquila')];

  const rotuloStatus = (status: 'operando' | 'manutencao' | 'fora') =>
    status === 'operando' ? ts('statusOperando') : status === 'manutencao' ? ts('statusManutencao') : ts('statusFora');

  return (
    <article aria-labelledby="titulo-tela" className="space-y-4">
      <h1 id="titulo-tela" className="text-2xl font-bold">
        {t('titulo')}
      </h1>
      <p className="text-texto-suave">{t('objetivo')}</p>

      {/* Sanitários PNE — rota em 1 toque (RF-26) */}
      <section aria-labelledby="serv-sanitarios" className="rounded-xl border-2 border-borda p-4">
        <h2 id="serv-sanitarios" className="font-bold">
          {ts('sanitarios')}
        </h2>
        <ul className="mt-2 space-y-2">
          {sanitarios.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-superficie p-3">
              <span>
                <strong>{s.nome}</strong>
                <span className="block text-sm text-texto-suave">
                  {s.numero} · {tp(s.pisoId as 'terreo')}
                </span>
              </span>
              <Link
                href={{ pathname: '/rota', query: { para: s.slug } }}
                className="alvo flex items-center rounded-lg bg-primaria px-3 font-bold text-primaria-texto"
              >
                <span aria-hidden="true">🧭</span> {tl('comoChegar')}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Elevadores e escadas rolantes — status textual (nunca só por cor) */}
      <section aria-labelledby="serv-elevadores" className="rounded-xl border-2 border-borda p-4">
        <h2 id="serv-elevadores" className="font-bold">
          {ts('elevadores')}
        </h2>
        <ul className="mt-2 space-y-2">
          {equipamentos.map((e) => (
            <li key={e.id} className="rounded-lg bg-superficie p-3">
              <span className="font-bold">
                {e.id} — {e.descricao}
              </span>
              <span className="block text-sm">
                <span aria-hidden="true">ℹ️</span> {rotuloStatus(e.status)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Entradas com Braille e NFC */}
      <section aria-labelledby="serv-entradas" className="rounded-xl border-2 border-borda p-4">
        <h2 id="serv-entradas" className="font-bold">
          {ts('entradas')}
        </h2>
        <ul className="mt-2 space-y-2">
          {entradas.map((p) => (
            <li key={p.codigo} className="rounded-lg bg-superficie p-3">
              <span className="font-bold">{p.nome[idioma] ?? p.nome['pt-BR']}</span>
              <span className="block text-sm text-texto-suave">
                {p.codigo} · {p.braille ? `✅ ${ts('braille')}` : `${tl('naoInformado')} (${ts('braille')})`} ·{' '}
                {p.nfc ? `✅ ${ts('nfc')}` : `${tl('naoInformado')} (${ts('nfc')})`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Outros serviços pedidos — sem dado na planta = "não informado" */}
      <section aria-labelledby="serv-outros" className="rounded-xl border-2 border-borda p-4">
        <h2 id="serv-outros" className="font-bold">
          {ts('outros')}
        </h2>
        <ul className="mt-2 space-y-1">
          {semDado.map((nome) => (
            <li key={nome} className="rounded-lg bg-superficie p-3">
              {nome}: <strong>{tl('naoInformado')}</strong>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-texto-suave">{ts('manterEquipe')}</p>
      </section>
    </article>
  );
}
