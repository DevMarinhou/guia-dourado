import { Suspense } from 'react';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import type { PisoId } from '@/dominio/tipos';
import { MapaDoPiso, type Marcador } from '@/funcionalidades/mapa/mapa-do-piso';
import { grafo, locais, pisos, pisosPublicos, pontos } from '@/lib/dados';

// T02: Mapa por piso (RF-07, RF-08, RF-27). SVG inline da planta (lido no build a partir de
// public/plantas/), marcadores como <button> focáveis, zoom/deslocamento e camadas; a lista
// de locais continua como alternativa textual completa.

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => pisosPublicos.map((piso) => ({ locale, piso })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/mapa/[piso]'>) {
  const { locale, piso } = await params;
  const t = await getTranslations({ locale, namespace: 'pisos' });
  return { title: pisosPublicos.includes(piso as PisoId) ? t(piso as 'terreo') : 'Mapa' };
}

const equipamentoDoNo = new Map<string, string>();
for (const a of grafo.arestas) {
  if (a.equipamentoId) {
    equipamentoDoNo.set(a.de, a.equipamentoId);
    equipamentoDoNo.set(a.para, a.equipamentoId);
  }
}

function camadaDaCategoria(categoria: string): Marcador['camada'] {
  if (categoria === 'alimentacao') return 'alimentacao';
  if (categoria === 'sanitario') return 'sanitarios';
  return 'lojas';
}

async function montarMarcadores(piso: PisoId): Promise<Marcador[]> {
  'use cache';
  const nosDoPiso = new Map(grafo.nos.filter((n) => n.pisoId === piso).map((n) => [n.id, n]));
  const marcadores: Marcador[] = [];

  // Lojas, alimentação e sanitários com entrada no grafo (focáveis → detalhe T04).
  for (const l of locais) {
    if (l.pisoId !== piso || !l.entradaNoId) continue;
    const no = nosDoPiso.get(l.entradaNoId);
    if (!no) continue;
    marcadores.push({
      id: l.id,
      x: no.x,
      y: no.y,
      rotulo: l.nome,
      camada: camadaDaCategoria(l.categoria),
      href: `/locais/${l.slug}`,
      ruido: l.sensorial?.ruido,
    });
  }

  // Elevadores, escadas rolantes e escadas (com status, RF-23) + mesa reservada PcD (RF-27).
  for (const n of nosDoPiso.values()) {
    if (n.tipo === 'elevador' || n.tipo === 'escada_rolante' || n.tipo === 'escada') {
      marcadores.push({
        id: n.id,
        x: n.x,
        y: n.y,
        rotulo: n.rotulo,
        camada: 'equipamentos',
        equipamentoId: equipamentoDoNo.get(n.id),
      });
    } else if (n.tipo === 'ponto' && n.id.includes('MESA')) {
      marcadores.push({ id: n.id, x: n.x, y: n.y, rotulo: n.rotulo, camada: 'mesas' });
    }
  }

  // Sensorial (RF-27): locais com nível de ruído, mesmo sem entrada marcada no grafo.
  for (const l of locais) {
    if (l.pisoId !== piso || !l.sensorial) continue;
    const no = l.entradaNoId ? nosDoPiso.get(l.entradaNoId) : undefined;
    if (!no) continue; // sem coordenada não inventamos posição (regra: não inventar dados)
    if (marcadores.some((m) => m.id === l.id)) continue;
    marcadores.push({
      id: `${l.id}-sensorial`,
      x: no.x,
      y: no.y,
      rotulo: l.nome,
      camada: 'sensorial',
      ruido: l.sensorial.ruido,
    });
  }

  return marcadores;
}

async function lerPlanta(planta: string | null | undefined): Promise<string | null> {
  'use cache';
  if (!planta) return null;
  return readFile(path.join(process.cwd(), 'public', planta.replace(/^\//, '')), 'utf8').catch(() => null);
}

async function Conteudo({ params }: { params: PageProps<'/[locale]/mapa/[piso]'>['params'] }) {
  const { locale, piso } = await params;
  setRequestLocale(locale);
  if (!pisosPublicos.includes(piso as PisoId)) notFound();
  const idPiso = piso as PisoId;
  const tp = await getTranslations('pisos');
  const tm = await getTranslations('mapa');

  const dadosDoPiso = pisos.find((p) => p.id === idPiso);
  const svg = await lerPlanta(dadosDoPiso?.planta);
  const marcadores = svg ? await montarMarcadores(idPiso) : [];
  const nosDoPiso = grafo.nos.filter((n) => n.pisoId === idPiso).map(({ id, x, y }) => ({ id, x, y }));
  const pontosDoPiso = pontos
    .filter((p) => p.ativo && p.noId)
    .map((p) => ({ codigo: p.codigo, noId: p.noId, nome: p.nome[locale as 'pt-BR'] ?? p.nome['pt-BR'] }));

  const doPiso = locais.filter((l) => l.pisoId === idPiso).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <>
      <h1 className="text-2xl font-bold">{tp(idPiso as 'terreo')}</h1>
      <nav aria-label="Pisos">
        <ul className="grid grid-cols-2 gap-2">
          {pisosPublicos.map((p) => (
            <li key={p}>
              <Link
                href={`/mapa/${p}`}
                aria-current={p === idPiso ? 'page' : undefined}
                className="alvo flex items-center justify-center rounded-lg border-2 border-borda p-2 text-center aria-[current=page]:bg-primaria aria-[current=page]:text-primaria-texto"
              >
                {tp(p as 'terreo')}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {svg ? (
        <MapaDoPiso svg={svg} nomeDoPiso={tp(idPiso as 'terreo')} marcadores={marcadores} nos={nosDoPiso} pontos={pontosDoPiso} />
      ) : (
        <p className="rounded-lg border border-borda p-3">{tm('semMarcadores')}</p>
      )}

      <section aria-labelledby="lista-alternativa" className="space-y-2">
        <h2 id="lista-alternativa" className="text-xl font-bold">
          {tm('listaTitulo')}
        </h2>
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
      </section>
    </>
  );
}

export default function PaginaMapa({ params }: PageProps<'/[locale]/mapa/[piso]'>) {
  return (
    <div className="space-y-4">
      {/* params dentro de <Suspense>: navegação instantânea (Next.js 16, como em ajuda/[id]). */}
      <Suspense fallback={null}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
