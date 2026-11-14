'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { buscarLocais } from '@/dominio/busca/buscar';
import type { Local } from '@/dominio/tipos';

/**
 * T03 — Buscar (RF-09): busca tolerante a acentos, sinônimos, número da loja e
 * pequenos erros de digitação (CT-05: "ca" → C&A, "banheiro" → sanitários).
 * Anuncia "N resultados" na região aria-live única do app, com debounce.
 */
export function BuscaLocais({ locais }: { locais: readonly Local[] }) {
  const t = useTranslations('busca');
  const anunciar = useAnunciador();
  const [consulta, setConsulta] = useState('');
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resultados = useMemo(() => buscarLocais(consulta, locais), [consulta, locais]);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  function aoDigitar(valor: string) {
    setConsulta(valor);
    if (temporizador.current) clearTimeout(temporizador.current);
    const q = valor.trim();
    if (q.length < 2) return;
    // Debounce: anuncia depois de uma breve pausa para não falar a cada letra.
    temporizador.current = setTimeout(() => {
      const n = buscarLocais(valor, locais).length;
      anunciar(n === 0 ? t('nenhumResultado') : t('resultados', { consulta: q, n }));
    }, 600);
  }

  function limpar() {
    setConsulta('');
    if (temporizador.current) clearTimeout(temporizador.current);
    anunciar(t('limpar'));
  }

  const comConsulta = consulta.trim().length > 0;

  return (
    <div className="space-y-4">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="space-y-2">
        <label htmlFor="q" className="font-bold">
          {t('rotulo')}
        </label>
        <div className="flex gap-2">
          <input
            id="q"
            name="q"
            type="search"
            value={consulta}
            onChange={(e) => aoDigitar(e.target.value)}
            placeholder={t('placeholder')}
            autoComplete="off"
            className="alvo w-full min-w-0 flex-1 rounded-lg border-2 border-borda bg-fundo px-3 text-lg text-texto"
          />
          {comConsulta && (
            <button type="button" onClick={limpar} className="alvo shrink-0 rounded-lg border-2 border-borda px-3">
              {t('limpar')}
            </button>
          )}
        </div>
      </form>

      {!comConsulta && <p className="rounded-lg bg-superficie p-3 text-sm text-texto-suave">{t('dica')}</p>}

      {comConsulta && (
        <section aria-labelledby="resultados-titulo" className="space-y-3">
          <h2 id="resultados-titulo" className="text-lg font-bold">
            {t('tituloResultados')} ({resultados.length})
          </h2>
          {resultados.length === 0 ? (
            <p role="status">{t('nenhumResultado')}</p>
          ) : (
            <ul className="space-y-2">
              {resultados.map(({ local }) => (
                <li key={local.id}>
                  <Link
                    href={`/locais/${local.slug}`}
                    className="alvo flex items-center justify-between gap-2 rounded-lg border-2 border-borda bg-superficie px-3 py-2"
                  >
                    <span>
                      <strong>{local.nome}</strong>
                      <span className="block text-sm text-texto-suave">{local.numero}</span>
                    </span>
                    <span aria-hidden="true">➡️</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
