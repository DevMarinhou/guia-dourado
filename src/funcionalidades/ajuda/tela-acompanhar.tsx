'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import type { Pedido, StatusPedido } from '@/lib/ajuda/tipos';

interface Props {
  id: string;
  token: string;
}

const ROTULO_STATUS: Record<StatusPedido, string> = {
  aberto: 'statusAberto',
  aceito: 'statusAceito',
  a_caminho: 'statusACaminho',
  concluido: 'statusConcluido',
  cancelado: 'statusCancelado',
  trote: 'statusTrote',
} as const;

const STATUS_FINAIS: readonly StatusPedido[] = ['concluido', 'cancelado', 'trote'];
const INTERVALO_MS = 5000;

/**
 * T09 — Acompanhar pedido (RF-21): consulta GET /api/ajuda/[id]?token= a cada 5 s,
 * anuncia mudanças de status pela região aria-live única e para de consultar quando
 * o pedido termina (concluído, cancelado ou trote).
 */
export function TelaAcompanhar({ id, token }: Props) {
  const t = useTranslations('acompanhar');
  const anunciar = useAnunciador();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState<'semToken' | 'consulta' | null>(token ? null : 'semToken');
  const statusAnterior = useRef<StatusPedido | null>(null);
  const parado = useRef(false);

  const consultar = useCallback(async () => {
    if (!token || parado.current) return;
    try {
      const resposta = await fetch(`/api/ajuda/${id}?token=${encodeURIComponent(token)}`);
      if (resposta.status === 404 || resposta.status === 401) {
        parado.current = true;
        setErro('semToken');
        anunciar(t('semToken'), 'assertive');
        return;
      }
      if (!resposta.ok) throw new Error('http');
      const dados = (await resposta.json()) as Pedido;
      setErro(null);
      setPedido(dados);
      if (statusAnterior.current && statusAnterior.current !== dados.status) {
        anunciar(t('avisoStatus', { status: t(ROTULO_STATUS[dados.status]) }), 'assertive');
      }
      statusAnterior.current = dados.status;
      if (STATUS_FINAIS.includes(dados.status)) parado.current = true;
    } catch {
      setErro('consulta');
    }
  }, [id, token, t, anunciar]);

  useEffect(() => {
    if (!token) return;
    // primeira consulta fora do corpo do effect (lint: setState em effect síncrono)
    const inicio = setTimeout(() => void consultar(), 0);
    const timer = setInterval(() => void consultar(), INTERVALO_MS);
    return () => {
      clearTimeout(inicio);
      clearInterval(timer);
    };
  }, [consultar, token]);

  async function cancelar(): Promise<void> {
    try {
      const resposta = await fetch(`/api/ajuda/${id}?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
      if (resposta.ok) {
        const dados = (await resposta.json()) as Pedido;
        setPedido(dados);
        anunciar(t('cancelado'));
      }
    } catch {
      setErro('consulta');
    }
  }

  if (erro === 'semToken') {
    return (
      <p role="alert" className="rounded-lg border-2 border-perigo p-3">
        {t('semToken')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <section aria-labelledby="status-pedido" className="rounded-xl border-2 border-primaria p-4">
        <h2 id="status-pedido" className="text-xl font-bold">
          {t('status')}
        </h2>
        <p className="mt-2 text-2xl font-bold" role="status">
          {pedido ? t(ROTULO_STATUS[pedido.status]) : t('atualizando')}
        </p>
        {pedido?.atendente && <p className="mt-1">{t('atendente', { nome: pedido.atendente })}</p>}
        {pedido?.previsaoMin !== null && pedido?.previsaoMin !== undefined && (
          <p className="mt-1">{t('previsao', { n: pedido.previsaoMin })}</p>
        )}
        {pedido?.observacao && <p className="mt-1 text-texto-suave">{pedido.observacao}</p>}
      </section>

      <p aria-live="polite" className="text-sm text-texto-suave">
        {erro === 'consulta' ? t('erro') : t('atualizando')}
      </p>

      {pedido && !STATUS_FINAIS.includes(pedido.status) && (
        <button
          type="button"
          className="alvo w-full rounded-lg border-2 border-perigo px-4 text-perigo"
          onClick={() => void cancelar()}
        >
          {t('cancelar')}
        </button>
      )}
    </div>
  );
}
