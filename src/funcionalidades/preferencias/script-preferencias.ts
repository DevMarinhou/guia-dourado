// Script inline executado ANTES da primeira pintura (guia "Preventing flash" do Next.js 16).
// Aplica tema, escala de fonte e movimento reduzido a partir do localStorage, sem "piscar".
// As preferências nunca saem do aparelho (ADR-0007).
export const CHAVE_PREFERENCIAS = 'gd:preferencias:v1';

export const scriptPreferencias = `
try {
  var p = JSON.parse(localStorage.getItem('${CHAVE_PREFERENCIAS}') || '{}');
  var r = document.documentElement;
  if (p.tema === 'escuro' || p.tema === 'alto-contraste') r.dataset.tema = p.tema;
  if (typeof p.escalaFonte === 'number' && p.escalaFonte >= 1 && p.escalaFonte <= 2) {
    r.style.setProperty('--escala-fonte', String(p.escalaFonte));
  }
  if (p.reduzirMovimento) r.dataset.movimento = 'reduzido';
} catch (e) {}
`;

/** Formato das preferências salvas (T01). */
export interface Preferencias {
  tema?: 'padrao' | 'escuro' | 'alto-contraste';
  escalaFonte?: number; // 1 a 2 (até 200%)
  reduzirMovimento?: boolean;
  lerEmVoz?: boolean;
  velocidadeVoz?: number;
  linguagemSimples?: boolean;
  libras?: boolean;
  perfilRota?: 'padrao' | 'sem_degraus' | 'mobilidade_reduzida' | 'visual' | 'sensorial';
  evitarRuido?: boolean;
  vibracao?: boolean;
}
