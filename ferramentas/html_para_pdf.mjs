// Converte o HTML consolidado em PDF marcado (acessível) com marcadores e rodapé.
// Uso: node ferramentas/html_para_pdf.mjs entrega/_entrega.html entrega/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const [, , entrada, saida] = process.argv;
if (!entrada || !saida) {
  console.error('uso: node html_para_pdf.mjs <entrada.html> <saida.pdf>');
  process.exit(1);
}
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = createRequire(import.meta.url)('playwright')); // instalação global
}
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.goto(pathToFileURL(path.resolve(entrada)).href, { waitUntil: 'load' });
await pagina.emulateMedia({ media: 'print' });
await pagina.pdf({
  path: saida,
  format: 'A4',
  printBackground: true,
  tagged: true,
  outline: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-size:8px;color:#5b6470;padding:0 16mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif">' +
    '<span>Guia Dourado: Planejamento Técnico Inicial v2 · Desafio 01</span>' +
    '<span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
  margin: { top: '16mm', bottom: '18mm', left: '0mm', right: '0mm' },
});
await navegador.close();
console.log('PDF gerado:', saida);
