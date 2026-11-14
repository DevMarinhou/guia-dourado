'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAnunciador } from '@/componentes/a11y/anunciador';

export type Camada = 'lojas' | 'alimentacao' | 'sanitarios' | 'equipamentos' | 'sensorial' | 'mesas';

export interface Marcador {
  id: string;
  /** Coordenadas no MESMO sistema do dados/grafo.json (viewBox 0 0 100 80). */
  x: number;
  y: number;
  rotulo: string;
  camada: Camada;
  /** Para lojas/sanitários: abre o detalhe (T04). Sem href: o toque anuncia a info. */
  href?: string;
  /** id em equipamentos.json (ELV-01…), quando o nó é um equipamento. */
  equipamentoId?: string;
  ruido?: 'baixo' | 'medio' | 'alto';
}

const CAMADAS: readonly Camada[] = ['lojas', 'alimentacao', 'sanitarios', 'equipamentos', 'sensorial', 'mesas'];
const ROTULO_CAMADA: Record<Camada, 'camadaLojas' | 'camadaAlimentacao' | 'camadaSanitarios' | 'camadaEquipamentos' | 'camadaSensorial' | 'camadaMesas'> = {
  lojas: 'camadaLojas',
  alimentacao: 'camadaAlimentacao',
  sanitarios: 'camadaSanitarios',
  equipamentos: 'camadaEquipamentos',
  sensorial: 'camadaSensorial',
  mesas: 'camadaMesas',
};
const ROTULO_STATUS = { operando: 'statusOperando', manutencao: 'statusManutencao', fora: 'statusFora' } as const;
const ROTULO_RUIDO = { baixo: 'ruidoBaixo', medio: 'ruidoMedio', alto: 'ruidoAlto' } as const;

/**
 * Distância mínima entre centros dos marcadores, na escala 0–100 da planta.
 * O viewBox é 100 × 80 e a altura segue a largura (mesma escala nos dois eixos),
 * então em ~360 px isso garante alvos de 48 px sem sobreposição (axe target-size).
 */
const DISTANCIA_MINIMA = 15;

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Empurra marcadores sobrepostos até que fiquem a ≥ DISTANCIA_MINIMA uns dos outros,
 * sem mudar a ordem nem sair da planta. Determinístico: as posições são estáveis
 * enquanto os dados não mudam (a distância só cresce em telas maiores ou com zoom).
 */
function distribuirMarcadores(marcadores: readonly Marcador[]): Marcador[] {
  const pontos = marcadores.map((m) => ({ ...m }));
  for (let volta = 0; volta < 40; volta++) {
    let moveu = false;
    for (let i = 0; i < pontos.length; i++) {
      for (let j = i + 1; j < pontos.length; j++) {
        const a = pontos[i]!;
        const b = pontos[j]!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d === 0) {
          // mesmíssima coordenada: empurra na horizontal para não travar
          dx = 1;
          dy = 0;
          d = 1;
        }
        if (d >= DISTANCIA_MINIMA) continue;
        const falta = (DISTANCIA_MINIMA - d) / 2;
        const ux = dx / d;
        const uy = dy / d;
        a.x = limitar(a.x - ux * falta, 4, 96);
        a.y = limitar(a.y - uy * falta, 6, 74);
        b.x = limitar(b.x + ux * falta, 4, 96);
        b.y = limitar(b.y + uy * falta, 6, 74);
        moveu = true;
      }
    }
    if (!moveu) break;
  }
  return pontos;
}

interface Props {
  svg: string;
  nomeDoPiso: string;
  marcadores: readonly Marcador[];
  /** Coordenadas dos nós do piso (para posicionar "você está aqui" após o QR). */
  nos: readonly { id: string; x: number; y: number }[];
  /** pontos.json (código → nó) para resolver o QR/sessão no cliente. */
  pontos: readonly { codigo: string; noId: string | null; nome: string }[];
}

/**
 * T02 — Mapa do piso (RF-07, RF-08, RF-27): SVG inline da planta (mesmo sistema de
 * coordenadas do grafo), marcadores como <button> focáveis, zoom e deslocamento por
 * botões e camadas alternáveis. A lista de locais continua como alternativa textual.
 */
export function MapaDoPiso({ svg, nomeDoPiso, marcadores, nos, pontos }: Props) {
  const t = useTranslations('mapa');
  const ts = useTranslations('servicos');
  const anunciar = useAnunciador();
  const router = useRouter();
  const areaRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [camadasAtivas, setCamadasAtivas] = useState<Record<Camada, boolean>>(() =>
    Object.fromEntries(CAMADAS.map((c) => [c, true])) as Record<Camada, boolean>,
  );
  const [equipamentos, setEquipamentos] = useState<Record<string, 'operando' | 'manutencao' | 'fora'>>({});
  const [origem, setOrigem] = useState<{ noId: string; nome: string } | null>(null);

  // Status dos equipamentos (RF-07: elevadores com status), timeout de 2 s.
  useEffect(() => {
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 2000);
    fetch('/api/equipamentos', { signal: controle.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then((dados: { equipamentos: { id: string; status: 'operando' | 'manutencao' | 'fora' }[] }) => {
        setEquipamentos(Object.fromEntries(dados.equipamentos.map((e) => [e.id, e.status])));
      })
      .catch(() => {
        // sem status: marcadores seguem sem o selo (a rota usa o padrão offline)
      })
      .finally(() => clearTimeout(limite));
    return () => {
      clearTimeout(limite);
      controle.abort();
    };
  }, []);

  // "Você está aqui" (RF-01): ponto do QR/sessão, lido depois da hidratação.
  useEffect(() => {
    const carregar = setTimeout(() => {
      try {
        const codigo = sessionStorage.getItem('gd:ponto');
        if (!codigo) return;
        const ponto = pontos.find((p) => p.codigo === codigo && p.noId);
        if (ponto) setOrigem({ noId: ponto.noId!, nome: ponto.nome });
      } catch {
        // armazenamento indisponível: segue sem o marcador de origem
      }
    }, 0);
    return () => clearTimeout(carregar);
  }, [pontos]);

  function alternarCamada(c: Camada) {
    setCamadasAtivas((atual) => ({ ...atual, [c]: !atual[c] }));
  }

  function mudarZoom(novo: number) {
    const valor = Math.min(3, Math.max(1, Math.round(novo * 10) / 10));
    setZoom(valor);
    anunciar(t('legendaZoom', { n: Math.round(valor * 100) }));
  }

  function deslocar(dx: number, dy: number) {
    areaRef.current?.scrollBy({ left: dx, top: dy, behavior: 'smooth' });
  }

  function statusDe(m: Marcador): string | null {
    if (!m.equipamentoId) return null;
    const status = equipamentos[m.equipamentoId];
    return status ? ts(ROTULO_STATUS[status]) : null;
  }

  function acionarMarcador(m: Marcador) {
    if (m.href) {
      router.push(m.href);
      return;
    }
    const status = statusDe(m);
    if (status) {
      anunciar(`${m.rotulo} — ${status}`, 'assertive');
      return;
    }
    anunciar(m.ruido ? t('anelRuido', { nivel: t(ROTULO_RUIDO[m.ruido]) }) : m.rotulo, 'assertive');
  }

  function rotuloDoMarcador(m: Marcador): string {
    const status = statusDe(m);
    if (status) return `${m.rotulo} — ${status}`;
    if (m.ruido) return `${m.rotulo}. ${t('anelRuido', { nivel: t(ROTULO_RUIDO[m.ruido]) })}`;
    return m.href ? t('irPara', { nome: m.rotulo }) : m.rotulo;
  }

  // Marcadores visíveis com separação mínima entre alvos (memo: só recalcula ao mudar camadas).
  const visiveis = useMemo(
    () => distribuirMarcadores(marcadores.filter((m) => camadasAtivas[m.camada])),
    [marcadores, camadasAtivas],
  );
  const temSensorial = camadasAtivas.sensorial;

  return (
    <div className="space-y-3">
      {/* ------------------------------------------------------- zoom e deslocar */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('camadas')}>
        <button type="button" className="alvo rounded-lg border-2 border-borda px-4" onClick={() => mudarZoom(zoom - 0.5)}>
          ➖ {t('zoomMenos')}
        </button>
        <button type="button" className="alvo rounded-lg border-2 border-borda px-4" onClick={() => mudarZoom(1)}>
          🎯 {t('zoomNormal')}
        </button>
        <button type="button" className="alvo rounded-lg border-2 border-borda px-4" onClick={() => mudarZoom(zoom + 0.5)}>
          ➕ {t('zoomMais')}
        </button>
        <span className="text-sm text-texto-suave" aria-hidden="true">
          {t('legendaZoom', { n: Math.round(zoom * 100) })}
        </span>
        <span className="ml-auto flex gap-2">
          <button type="button" className="alvo rounded-lg border-2 border-borda px-3" onClick={() => deslocar(0, -120)} aria-label={t('cima')}>
            ↑
          </button>
          <button type="button" className="alvo rounded-lg border-2 border-borda px-3" onClick={() => deslocar(0, 120)} aria-label={t('baixo')}>
            ↓
          </button>
          <button type="button" className="alvo rounded-lg border-2 border-borda px-3" onClick={() => deslocar(-120, 0)} aria-label={t('esquerda')}>
            ←
          </button>
          <button type="button" className="alvo rounded-lg border-2 border-borda px-3" onClick={() => deslocar(120, 0)} aria-label={t('direita')}>
            →
          </button>
        </span>
      </div>

      {/* --------------------------------------------------------------- camadas */}
      <fieldset className="rounded-lg border border-borda p-3">
        <legend className="px-1 font-bold">{t('camadas')}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {CAMADAS.map((c) => (
            <label key={c} className="alvo flex cursor-pointer items-center gap-2 rounded px-1">
              <input
                type="checkbox"
                className="h-6 w-6 accent-primaria"
                checked={camadasAtivas[c]}
                onChange={() => alternarCamada(c)}
              />
              {t(ROTULO_CAMADA[c])}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ------------------------------------------------------------------ planta */}
      <div
        ref={areaRef}
        className="relative overflow-auto rounded-xl border-2 border-borda"
        role="group"
        aria-label={t('planta', { nome: nomeDoPiso })}
      >
        <div className="relative" style={{ width: `${zoom * 100}%` }}>
          <div dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="pointer-events-none absolute inset-0">
            {/* origem primeiro (sob os botões): não pode obscurecer nenhum alvo */}
            {origem && (() => {
              const no = nos.find((n) => n.id === origem.noId);
              if (!no) return null;
              return (
                <span
                  className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-ajuda bg-fundo text-xl"
                  style={{ left: `${limitar(no.x, 4, 96)}%`, top: `${limitar((no.y / 80) * 100, 7.5, 92.5)}%` }}
                  role="img"
                  aria-label={t('origemAqui', { nome: origem.nome })}
                >
                  <span aria-hidden="true">📍</span>
                </span>
              );
            })()}
            {visiveis.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`alvo pointer-events-auto absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-lg shadow ${
                  m.camada === 'equipamentos'
                    ? 'border-primaria bg-primaria text-primaria-texto'
                    : m.camada === 'sanitarios'
                      ? 'border-ajuda bg-ajuda text-ajuda-texto'
                      : m.camada === 'mesas'
                        ? 'border-perigo bg-fundo text-texto'
                        : 'border-borda bg-fundo text-texto'
                } ${temSensorial && m.ruido ? 'ring-4 ring-perigo' : ''}`}
                style={{ left: `${m.x}%`, top: `${(m.y / 80) * 100}%` }}
                onClick={() => acionarMarcador(m)}
                aria-label={rotuloDoMarcador(m)}
              >
                <span aria-hidden="true">
                  {m.camada === 'equipamentos' ? '🛗' : m.camada === 'sanitarios' ? '🚻' : m.camada === 'mesas' ? '♿' : '📍'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-texto-suave">
        {visiveis.length === 0 ? t('semMarcadores') : t('marcadores')}: {visiveis.length}
      </p>
    </div>
  );
}
