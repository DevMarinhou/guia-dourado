'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import type { Pedido, StatusEquipamento, StatusPedido } from '@/lib/ajuda/tipos';

interface Props {
  /** Dica inicial do servidor: true quando CENTRAL_CHAVE existe no build/render. */
  dicaChave: boolean;
}

type Acao = 'aceito' | 'a_caminho' | 'concluido' | 'trote';

const ROTULO_STATUS: Record<StatusPedido, string> = {
  aberto: 'statusAberto',
  aceito: 'statusAceito',
  a_caminho: 'statusACaminho',
  concluido: 'statusConcluido',
  cancelado: 'statusCancelado',
  trote: 'statusTrote',
} as const;

const ROTULO_TIPO: Record<string, string> = {
  orientacao: 'tipoOrientacao',
  acompanhamento: 'tipoAcompanhamento',
  comunicacao: 'tipoComunicacao',
  saude: 'tipoSaude',
  crianca_perdida: 'tipoCrianca',
  seguranca: 'tipoSeguranca',
} as const;

const PROXIMA_ACAO: Partial<Record<StatusPedido, readonly Acao[]>> = {
  aberto: ['aceito', 'trote'],
  aceito: ['a_caminho', 'concluido', 'trote'],
  a_caminho: ['concluido', 'trote'],
};

const ROTULO_EQUIP: Record<StatusEquipamento['status'], string> = {
  operando: 'statusOperando',
  manutencao: 'statusManutencao',
  fora: 'statusFora',
} as const;

const INTERVALO_MS = 3000; // plano B da ADR-0008: polling enquanto o Realtime não entra

/**
 * T12 — Central (RF-22, RF-23): fila com polling de 3 s, ações do atendente
 * (aceitar, a caminho, concluir, trote) e alternância de status dos equipamentos
 * que o T05 consulta. Alerta visual + região aria-live para pedido novo.
 */
export function TelaCentral({ dicaChave }: Props) {
  const t = useTranslations('central');
  const anunciar = useAnunciador();

  const [exigeChave, setExigeChave] = useState(dicaChave);
  const [chave, setChave] = useState('');
  const [chaveDigitada, setChaveDigitada] = useState('');
  const [chaveErrada, setChaveErrada] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [equipamentos, setEquipamentos] = useState<StatusEquipamento[]>([]);
  const [fonte, setFonte] = useState('');
  const [erro, setErro] = useState('');
  const [destaque, setDestaque] = useState<string | null>(null);
  const idsConhecidos = useRef<Set<string> | null>(null);
  const chaveRef = useRef('');

  const enviarCabecalho = useCallback(
    (): Record<string, string> => (chaveRef.current ? { 'x-central-chave': chaveRef.current } : {}),
    [],
  );

  const carregar = useCallback(async () => {
    try {
      const [fila, equip] = await Promise.all([
        fetch('/api/central', { headers: enviarCabecalho() }),
        fetch('/api/equipamentos'),
      ]);
      if (fila.status === 401) {
        setErro('chave');
        setChaveErrada(true);
        setChave('');
        setExigeChave(true); // a API é a fonte de verdade: sem chave, mostra o login
        return;
      }
      if (!fila.ok) throw new Error('http');
      const dadosFila = await fila.json();
      const dadosEquip = equip.ok ? await equip.json() : { equipamentos: [] };
      setErro('');
      setFonte(dadosFila.fonte ?? '');

      const lista: Pedido[] = dadosFila.pedidos ?? [];
      const novos = lista.filter((p) => p.status === 'aberto' && idsConhecidos.current && !idsConhecidos.current.has(p.id));
      setPedidos(lista);
      setEquipamentos(dadosEquip.equipamentos ?? []);
      if (idsConhecidos.current === null) {
        idsConhecidos.current = new Set(lista.map((p) => p.id));
      } else if (novos.length > 0) {
        for (const p of novos) idsConhecidos.current.add(p.id);
        setDestaque(novos[0]?.id ?? null);
        anunciar(t('novoPedido'), 'assertive');
        window.setTimeout(() => setDestaque(null), 4000);
      }
    } catch {
      setErro('consulta');
    }
  }, [anunciar, enviarCabecalho, t]);

  useEffect(() => {
    // primeira carga fora do corpo do effect (lint: setState em effect síncrono)
    const inicio = setTimeout(() => void carregar(), 0);
    const timer = setInterval(() => void carregar(), INTERVALO_MS);
    return () => {
      clearTimeout(inicio);
      clearInterval(timer);
    };
  }, [carregar]);

  function entrar(e: React.FormEvent): void {
    e.preventDefault();
    chaveRef.current = chaveDigitada.trim();
    setChave(chaveDigitada.trim());
    setChaveErrada(false);
    setErro('');
    void carregar();
  }

  async function agir(id: string, acao: Acao): Promise<void> {
    if (acao === 'trote' && !window.confirm(t('confirmarTrote'))) return;
    try {
      const resposta = await fetch('/api/central', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...enviarCabecalho() },
        body: JSON.stringify({ id, acao }),
      });
      if (resposta.ok) {
        anunciar(t('acaoFeita'));
        await carregar();
      } else if (resposta.status === 401) {
        setErro('chave');
        setChaveErrada(true);
        setChave('');
        setExigeChave(true);
      }
    } catch {
      setErro('consulta');
    }
  }

  async function trocarEquipamento(equip: StatusEquipamento): Promise<void> {
    const proximo: StatusEquipamento['status'] =
      equip.status === 'operando' ? 'manutencao' : equip.status === 'manutencao' ? 'fora' : 'operando';
    try {
      const resposta = await fetch('/api/equipamentos', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', ...enviarCabecalho() },
        body: JSON.stringify({ id: equip.id, status: proximo }),
      });
      if (resposta.ok) {
        anunciar(t('equipAlterado', { id: equip.id, status: t(ROTULO_EQUIP[proximo]) }));
        await carregar();
      }
    } catch {
      setErro('consulta');
    }
  }

  // ------------------------------------------------------------- login da chave
  if (exigeChave && !chave) {
    return (
      <form onSubmit={entrar} className="mx-auto max-w-sm space-y-3 rounded-xl border-2 border-borda p-4">
        <h1 className="text-2xl font-bold">{t('titulo')}</h1>
        <label className="block space-y-1">
          <span className="font-bold">{t('chave')}</span>
          <input
            type="password"
            className="alvo w-full rounded-lg border-2 border-borda bg-fundo px-3"
            value={chaveDigitada}
            onChange={(e) => setChaveDigitada(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {chaveErrada && (
          <p role="alert" className="rounded-lg border-2 border-perigo p-2">
            {t('chaveErrada')}
          </p>
        )}
        <button type="submit" className="alvo w-full rounded-lg border-2 border-primaria bg-primaria px-4 text-primaria-texto">
          {t('entrar')}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>

      {fonte === 'demonstracao' && (
        <p role="status" className="rounded-lg border-2 border-borda bg-superficie p-3 text-sm">
          {t('modoDemonstracao')}
        </p>
      )}
      {erro === 'consulta' && (
        <p role="alert" className="rounded-lg border-2 border-perigo p-3">
          {t('erroConsulta')}
        </p>
      )}

      {/* ------------------------------------------------------------ fila */}
      <section aria-labelledby="fila" className="rounded-xl border border-borda p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="fila" className="text-xl font-bold">
            {t('fila')}
          </h2>
          <span className="ml-auto rounded-lg border border-borda px-2 py-1 text-sm">{pedidos.length}</span>
        </div>
        <p className="mt-1 text-sm text-texto-suave">{t('atualizando')}</p>

        {pedidos.length === 0 && <p className="mt-3 text-texto-suave">{t('filaVazia')}</p>}

        <ul className="mt-3 space-y-3">
          {pedidos.map((p) => (
            <li
              key={p.id}
              className={`rounded-lg border-2 p-3 ${p.prioridade === 1 ? 'border-perigo' : 'border-borda'} ${
                destaque === p.id ? 'bg-primaria/15' : 'bg-superficie'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <strong>{t(ROTULO_TIPO[p.tipo] ?? 'tipoOrientacao')}</strong>
                {p.prioridade === 1 && (
                  <span className="rounded bg-perigo px-2 py-0.5 text-sm font-bold text-perigo-texto">{t('prioridadeAlta')}</span>
                )}
                <span className="rounded border border-borda px-2 py-0.5 text-sm">{t(ROTULO_STATUS[p.status])}</span>
                <time className="ml-auto text-sm text-texto-suave" dateTime={p.criadoEm}>
                  {new Date(p.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <p className="mt-1 text-sm">{t('pedidoDe', { ponto: p.pontoCodigo, modo: p.modoComunicacao, idioma: p.idioma })}</p>
              {p.observacao && <p className="mt-1 text-sm text-texto-suave">“{p.observacao}”</p>}
              {p.atendente && <p className="mt-1 text-sm">{t('atendidoPor', { nome: p.atendente })}</p>}

              {(PROXIMA_ACAO[p.status] ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(PROXIMA_ACAO[p.status] ?? []).map((acao) => (
                    <button
                      key={acao}
                      type="button"
                      className={`alvo rounded-lg border-2 px-3 ${
                        acao === 'trote' ? 'border-perigo text-perigo' : 'border-primaria bg-primaria text-primaria-texto'
                      }`}
                      onClick={() => void agir(p.id, acao)}
                    >
                      {t(acao === 'aceito' ? 'aceitar' : acao === 'a_caminho' ? 'aCaminho' : acao === 'concluido' ? 'concluir' : 'trote')}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------- equipamentos */}
      <section aria-labelledby="equipamentos" className="rounded-xl border border-borda p-4">
        <h2 id="equipamentos" className="text-xl font-bold">
          {t('equipamentos')}
        </h2>
        <p className="mt-1 text-sm text-texto-suave">{t('equipDica')}</p>
        <ul className="mt-3 space-y-2">
          {equipamentos.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-borda p-2">
              <strong>{e.id}</strong>
              <span className="text-sm text-texto-suave">{e.tipo}</span>
              <span className={`rounded px-2 py-0.5 text-sm ${e.status === 'operando' ? 'border border-borda' : 'bg-perigo text-perigo-texto'}`}>
                {t(ROTULO_EQUIP[e.status])}
              </span>
              <button
                type="button"
                className="alvo ml-auto rounded-lg border-2 border-borda px-3"
                onClick={() => void trocarEquipamento(e)}
                aria-label={t('equipTrocar', { id: e.id })}
              >
                🔄 {t('trocar')}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
