import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Varredura axe (WCAG 2.0/2.1/2.2 A e AA) nas rotas principais, nos temas padrão e alto contraste.
const ROTAS = ['/', '/en', '/es', '/guia', '/mapa/terreo', '/locais/outback-steakhouse', '/prancha', '/conversar', '/letreiro', '/ajuda', '/acessibilidade', '/central'];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const rota of ROTAS) {
  for (const tema of ['padrao', 'escuro', 'alto-contraste'] as const) {
    test(`axe sem violações: ${rota} (${tema})`, async ({ page }) => {
      await page.addInitScript((t) => {
        if (t !== 'padrao') localStorage.setItem('gd:preferencias:v1', JSON.stringify({ tema: t }));
      }, tema);
      await page.goto(rota);
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const graves = r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(graves.map((v) => `${v.id}: ${v.nodes.length} nó(s)`)).toEqual([]);
    });
  }
}

test.describe('QR em português', () => {
  test.use({ locale: 'pt-BR' });
  test('QR resolve o ponto e mostra "Você está em" (CT-01)', async ({ page }) => {
    await page.goto('/q/ENT-JK');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByText('Entrada Av. JK')).toBeVisible();
  });
});

test.describe('QR em espanhol (turista)', () => {
  test.use({ locale: 'es-AR' });
  test('abre no idioma do aparelho (CT-13)', async ({ page }) => {
    await page.goto('/q/mesa-07');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByText('Mesa 07, Patio de comidas')).toBeVisible();
  });
});

test('cada página tem um único h1 (WCAG 2.4.6)', async ({ page }) => {
  for (const rota of ROTAS) {
    await page.goto(rota);
    await expect(page.locator('h1'), rota).toHaveCount(1);
  }
});
