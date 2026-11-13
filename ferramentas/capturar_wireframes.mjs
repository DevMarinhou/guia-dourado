// Captura cada tela dos wireframes como PNG (usado no apêndice do documento de entrega).
// Uso: node ferramentas/capturar_wireframes.mjs wireframes/index.html entrega/wireframes
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const [, , entrada = 'wireframes/index.html', saida = 'entrega/wireframes'] = process.argv;
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = createRequire(import.meta.url)('playwright')); // instalação global
}
fs.mkdirSync(saida, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: 1400, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
});
await pagina.goto(pathToFileURL(path.resolve(entrada)).href, { waitUntil: 'load' });
const secoes = await pagina.locator('section.cartao').all();
for (const secao of secoes) {
  const id = (await secao.locator('h3').getAttribute('id')).toUpperCase();
  await secao.locator('figure').screenshot({ path: path.join(saida, `${id}.png`) });
  console.log('capturado', id);
}
await navegador.close();
