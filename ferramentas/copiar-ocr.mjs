// Copia os arquivos do Tesseract.js (OCR do leitor de letreiro) de node_modules para public/ocr/,
// para o OCR funcionar sem CDN de terceiros e ficar em cache no aparelho.
// Roda sozinho após `npm install`/`npm ci` (script "postinstall"). public/ocr/ não é versionado.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = join(raiz, 'node_modules');
const destino = join(raiz, 'public', 'ocr');

const arquivos = [
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'],
  // Só as variantes LSTM; o Tesseract escolhe a melhor para o aparelho (SIMD quando houver).
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'core/tesseract-core-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'core/tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'core/tesseract-core-relaxedsimd-lstm.wasm.js'],
  // Português, modelo "best_int" (~1,4 MB): bom equilíbrio entre precisão e tamanho.
  ['@tesseract.js-data/por/4.0.0_best_int/por.traineddata.gz', 'lang/por.traineddata.gz'],
];

let faltando = 0;
for (const [de, para] of arquivos) {
  const origem = join(nm, de);
  if (!existsSync(origem)) {
    console.warn(`[copiar-ocr] não encontrado: ${de}`);
    faltando++;
    continue;
  }
  const alvo = join(destino, para);
  mkdirSync(dirname(alvo), { recursive: true });
  copyFileSync(origem, alvo);
}
console.log(`[copiar-ocr] ${arquivos.length - faltando}/${arquivos.length} arquivos em public/ocr/`);
