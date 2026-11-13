// Gera as artes das placas QR (+ código curto) para cada ponto de dados/pontos.json.
// Uso: URL_BASE=https://seu-dominio npm run qr:gerar  → entrega/qr/placas.html (imprimir em A4) e um SVG por ponto.
// Lembrete (docs/14): na placa real, somar etiqueta NFC, Braille/relevo e lacre contra QR falso.
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';

const base = (process.env.URL_BASE ?? 'https://guia-dourado.vercel.app').replace(/\/$/, '');
const { pontos } = JSON.parse(fs.readFileSync('dados/pontos.json', 'utf8'));
const saida = 'entrega/qr';
fs.mkdirSync(saida, { recursive: true });

const escapar = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cartoes = [];
for (const p of pontos.filter((x) => x.ativo)) {
  const url = `${base}/q/${p.codigo}`;
  const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'Q', margin: 4 });
  fs.writeFileSync(path.join(saida, `${p.codigo}.svg`), svg);
  cartoes.push(`<section class="placa">
  <h2>Guia Dourado</h2>
  <p class="sub">Acessibilidade · Libras · Rotas · Ajuda</p>
  <div class="qr" role="img" aria-label="QR Code para ${escapar(url)}">${svg}</div>
  <p class="codigo">${escapar(p.codigo)}</p>
  <p>${escapar(p.nome['pt-BR'])}</p>
  <p class="url">${escapar(url.replace(/^https?:\/\//, ''))}</p>
  <p class="nfc">${p.nfc ? 'Ou encoste o celular aqui (NFC)' : ''}</p>
</section>`);
  console.log('QR', p.codigo, '→', url);
}

fs.writeFileSync(
  path.join(saida, 'placas.html'),
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Placas QR · Guia Dourado</title>
<style>
  body{font-family:Arial,sans-serif;margin:0}
  .placa{width:90mm;min-height:130mm;border:2px solid #0b4f8a;border-radius:6mm;padding:6mm;margin:5mm;display:inline-block;vertical-align:top;text-align:center;break-inside:avoid}
  h2{color:#0b4f8a;margin:0;font-size:20pt} .sub{margin:1mm 0 3mm;font-size:10pt}
  .qr svg{width:60mm;height:60mm} .codigo{font-size:22pt;font-weight:bold;letter-spacing:1px;margin:2mm 0}
  .url{font-size:9pt;color:#333} .nfc{font-size:10pt;font-weight:bold}
</style></head><body>
${cartoes.join('\n')}
</body></html>`,
);
console.log(`\nAbra ${saida}/placas.html e imprima (A4, sem margens extras).`);
