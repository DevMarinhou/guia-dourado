// Integração com o VLibras (gov.br), carregado sob demanda (ADR-0006).
// O widget depende do serviço vlibras.gov.br e de internet; sem ele, mostramos vídeos gravados (fase 2).
const URL_SCRIPT = 'https://vlibras.gov.br/app/vlibras-plugin.js';
const URL_APP = 'https://vlibras.gov.br/app';

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
  }
}

let carregamento: Promise<boolean> | null = null;

function montarMarcacao(): void {
  if (document.querySelector('[vw]')) return;
  const raiz = document.createElement('div');
  raiz.setAttribute('vw', '');
  raiz.className = 'enabled';
  raiz.innerHTML =
    '<div vw-access-button class="active"></div>' +
    '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(raiz);
}

/** Baixa o script do VLibras (uma vez) e inicializa o widget. Retorna false se falhar. */
export function ativarVLibras(): Promise<boolean> {
  if (carregamento) return carregamento;
  carregamento = new Promise<boolean>((resolve) => {
    montarMarcacao();
    const s = document.createElement('script');
    s.src = URL_SCRIPT;
    s.async = true;
    s.onload = () => {
      try {
        if (window.VLibras) new window.VLibras.Widget(URL_APP);
        resolve(Boolean(window.VLibras));
      } catch {
        resolve(false);
      }
    };
    s.onerror = () => {
      carregamento = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return carregamento;
}
