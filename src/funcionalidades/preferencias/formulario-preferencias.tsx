'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CHAVE_PREFERENCIAS, type Preferencias } from './script-preferencias';

/**
 * T01 — Preferências funcionais (RF-03).
 * Salva em localStorage (gd:preferencias:v1) e aplica NA HORA (data-tema,
 * --escala-fonte, data-movimento). O script-preferencias reaplica antes da
 * primeira pintura ao recarregar — sem "piscar" (CT-07).
 */
const PADRAO: Preferencias = {
  tema: 'padrao',
  escalaFonte: 1,
  reduzirMovimento: false,
  lerEmVoz: false,
  linguagemSimples: false,
  libras: false,
  perfilRota: 'padrao',
  evitarRuido: false,
  vibracao: false,
};

const TEMAS = ['padrao', 'escuro', 'alto-contraste'] as const;
const PERFIS = ['padrao', 'sem_degraus', 'mobilidade_reduzida', 'visual', 'sensorial'] as const;

export function FormularioPreferencias() {
  const t = useTranslations('preferencias');
  // Carrega o que já estava salvo neste aparelho (estado inicial, sem efeito).
  const [pref, setPref] = useState<Preferencias>(() => {
    if (typeof window === 'undefined') return PADRAO;
    try {
      const salvo = localStorage.getItem(CHAVE_PREFERENCIAS);
      return salvo ? { ...PADRAO, ...JSON.parse(salvo) } : PADRAO;
    } catch {
      // armazenamento indisponível: segue com os padrões
      return PADRAO;
    }
  });
  const [salvou, setSalvou] = useState(false);

  // Aplica as preferências no <html> sempre que mudam (React controla o DOM aqui).
  useEffect(() => {
    const raiz = document.documentElement;
    if (pref.tema === 'escuro' || pref.tema === 'alto-contraste') raiz.dataset.tema = pref.tema;
    else delete raiz.dataset.tema;
    if (typeof pref.escalaFonte === 'number') raiz.style.setProperty('--escala-fonte', String(pref.escalaFonte));
    if (pref.reduzirMovimento) raiz.dataset.movimento = 'reduzido';
    else delete raiz.dataset.movimento;
  }, [pref]);

  function atualizar(parcial: Partial<Preferencias>) {
    const p = { ...pref, ...parcial };
    setPref(p);
    try {
      localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(p));
    } catch {
      // sem armazenamento: a preferência vale só nesta sessão
    }
    setSalvou(true);
  }

  function mudarEscala(delta: number) {
    const atual = pref.escalaFonte ?? 1;
    const proximo = Math.min(2, Math.max(1, Math.round((atual + delta) * 10) / 10));
    atualizar({ escalaFonte: proximo });
  }

  const rotuloTema = (op: (typeof TEMAS)[number]) =>
    op === 'padrao' ? t('temaPadrao') : op === 'escuro' ? t('temaEscuro') : t('temaContraste');

  const rotuloPerfil = (op: (typeof PERFIS)[number]) => {
    switch (op) {
      case 'padrao':
        return t('perfilPadrao');
      case 'sem_degraus':
        return t('perfilSemDegraus');
      case 'mobilidade_reduzida':
        return t('perfilMobilidade');
      case 'visual':
        return t('perfilVisual');
      case 'sensorial':
        return t('perfilSensorial');
    }
  };

  function opcaoBoleana(rotulo: string, chave: keyof Preferencias) {
    const marcado = Boolean(pref[chave]);
    return (
      <label className="flex min-h-12 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={marcado}
          onChange={(e) => atualizar({ [chave]: e.target.checked } as Partial<Preferencias>)}
          className="size-6 shrink-0 accent-[var(--cor-primaria)]"
        />
        <span>{rotulo}</span>
      </label>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tema */}
      <fieldset className="rounded-xl border-2 border-borda p-4">
        <legend className="px-2 font-bold">{t('tema')}</legend>
        <div className="flex flex-wrap gap-2">
          {TEMAS.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => atualizar({ tema: op })}
              aria-pressed={pref.tema === op}
              className="alvo rounded border-2 border-borda px-4 aria-pressed:border-primaria aria-pressed:bg-primaria aria-pressed:text-primaria-texto"
            >
              {rotuloTema(op)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Tamanho da letra */}
      <fieldset className="rounded-xl border-2 border-borda p-4">
        <legend className="px-2 font-bold">{t('fonte')}</legend>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => mudarEscala(-0.1)}
            aria-label={t('diminuirFonte')}
            disabled={(pref.escalaFonte ?? 1) <= 1}
            className="alvo rounded border-2 border-borda px-4 text-lg disabled:opacity-40"
          >
            A−
          </button>
          <span aria-live="polite" className="min-w-32 text-center font-bold">
            {t('escalaAtual', { n: Math.round((pref.escalaFonte ?? 1) * 100) })}
          </span>
          <button
            type="button"
            onClick={() => mudarEscala(0.1)}
            aria-label={t('aumentarFonte')}
            disabled={(pref.escalaFonte ?? 1) >= 2}
            className="alvo rounded border-2 border-borda px-4 text-lg disabled:opacity-40"
          >
            A+
          </button>
        </div>
      </fieldset>

      {/* Comportamento */}
      <fieldset className="rounded-xl border-2 border-borda p-4">
        <legend className="px-2 font-bold">{t('voz')}</legend>
        <div className="space-y-1">
          {opcaoBoleana(t('voz'), 'lerEmVoz')}
          {opcaoBoleana(t('movimento'), 'reduzirMovimento')}
          {opcaoBoleana(t('linguagemSimples'), 'linguagemSimples')}
          {opcaoBoleana(t('libras'), 'libras')}
        </div>
      </fieldset>

      {/* Perfil de rota */}
      <fieldset className="rounded-xl border-2 border-borda p-4">
        <legend className="px-2 font-bold">{t('perfilRota')}</legend>
        <div className="space-y-1">
          {PERFIS.map((op) => (
            <label key={op} className="flex min-h-12 cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="perfil-rota"
                checked={pref.perfilRota === op}
                onChange={() => atualizar({ perfilRota: op })}
                className="size-6 shrink-0 accent-[var(--cor-primaria)]"
              />
              <span>{rotuloPerfil(op)}</span>
            </label>
          ))}
          {opcaoBoleana(t('evitarRuido'), 'evitarRuido')}
          {opcaoBoleana(t('vibracao'), 'vibracao')}
        </div>
      </fieldset>

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="alvo flex flex-1 items-center justify-center rounded-lg bg-primaria px-4 py-3 font-bold text-primaria-texto">
          {t('pular')}
        </Link>
        <button
          type="button"
          onClick={() => atualizar(PADRAO)}
          className="alvo rounded-lg border-2 border-borda px-4 py-3 font-bold"
        >
          {t('restaurar')}
        </button>
      </div>

      <p role="status" className={salvou ? 'rounded-lg bg-superficie p-3 font-bold' : undefined}>
        {salvou ? t('salvo') : ''}
      </p>
    </div>
  );
}
