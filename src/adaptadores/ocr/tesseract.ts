// Adaptador de OCR: Tesseract.js (WebAssembly) rodando no próprio celular.
// Gratuito, sem enviar imagens para servidor (privacidade) e sem CDN de terceiros:
// os arquivos ficam em /ocr/ (copiados por ferramentas/copiar-ocr.mjs no postinstall).
// Um único worker para o app inteiro (criar custa ~1–3 s e ~30 MB de memória).
import type { Worker as WorkerTesseract } from 'tesseract.js';

const BASE = '/ocr';

let promessaWorker: Promise<WorkerTesseract> | null = null;

async function criarWorker(): Promise<WorkerTesseract> {
  // Import dinâmico: o tesseract.js só é baixado quando o leitor de letreiro é aberto.
  const { createWorker, OEM, PSM } = await import('tesseract.js');
  const worker = await createWorker('por', OEM.LSTM_ONLY, {
    workerPath: `${BASE}/worker.min.js`,
    corePath: `${BASE}/core`, // pasta: o Tesseract escolhe a variante (simd/relaxedsimd/padrão)
    langPath: `${BASE}/lang`,
    workerBlobURL: false,
    gzip: true,
  });
  // Segmentação automática (SPARSE_TEXT devolve texto vazio com o modelo "best_int" em português).
  await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
  return worker;
}

/** Carrega o motor (1ª vez baixa ~5 MB; depois vem do cache do navegador). */
export function prepararOcr(): Promise<WorkerTesseract> {
  promessaWorker ??= criarWorker().catch((erro: unknown) => {
    promessaWorker = null; // permite tentar de novo (ex.: a internet voltou)
    throw erro;
  });
  return promessaWorker;
}

export async function lerTexto(imagem: HTMLCanvasElement): Promise<string> {
  const worker = await prepararOcr();
  const { data } = await worker.recognize(imagem);
  return data.text;
}

export async function encerrarOcr(): Promise<void> {
  const promessa = promessaWorker;
  promessaWorker = null;
  const worker = await promessa?.catch(() => null);
  await worker?.terminate();
}

/**
 * Copia o quadro atual do vídeo para um canvas em tons de cinza com contraste reforçado.
 * `centro`: só a região central (80% × 60%), para onde a pessoa aponta — menos pixels e letras
 * maiores no recorte, o que deixa a leitura mais rápida e mais precisa.
 */
export function capturarQuadro(video: HTMLVideoElement, larguraMax = 1280, centro = true): HTMLCanvasElement | null {
  const { videoWidth: vw, videoHeight: vh } = video;
  if (vw === 0 || vh === 0) return null;
  const sx = centro ? vw * 0.1 : 0;
  const sy = centro ? vh * 0.2 : 0;
  const sw = centro ? vw * 0.8 : vw;
  const sh = centro ? vh * 0.6 : vh;
  const escala = Math.min(1, larguraMax / sw);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * escala);
  canvas.height = Math.round(sh * escala);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.filter = 'grayscale(1) contrast(1.4)'; // ignorado onde não houver suporte
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}
