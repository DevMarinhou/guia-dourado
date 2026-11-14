import { expect, test } from '@playwright/test';

// 🥚 EASTER EGG (T04) — regra de ouro do AGENTS.md: intocável e sempre demonstrável.
// 13 toques no ♡ do cabeçalho revelam "Combo Sexta-feira 13 Sem Sustos — R$ 13,00"
// no cardápio, compatível com Ouvir/Libras/Linguagem simples.
test('13 toques no favorito revelam o Prato Secreto no cardápio', async ({ page }) => {
  await page.goto('/pt-BR/locais/outback-steakhouse');
  await expect(page.getByRole('heading', { level: 1, name: 'Outback Steakhouse' })).toBeVisible();

  const favorito = page.getByRole('button', { name: /^Favoritar \(/ });
  // o cardápio de alimentação já existe; o secreto aparece só após o 13º toque
  await expect(page.getByText('Combo Sexta-feira 13 Sem Sustos')).toHaveCount(0);

  for (let toque = 1; toque <= 13; toque += 1) {
    await favorito.click();
  }

  // aviso visual + anúncio (aria-live) do título do ovo
  await expect(page.getByText('Prato secreto revelado: Poção Anti-Azar!')).toBeVisible();
  // o item entra no cardápio com o preço exato da missão
  await expect(page.getByText('Combo Sexta-feira 13 Sem Sustos')).toBeVisible();
  await expect(page.getByText('R$ 13,00')).toBeVisible();
  // contador do botão confirma os 13 toques
  await expect(favorito).toHaveAttribute('aria-label', /13 de 13/);
});

test('item secreto acompanha a Linguagem simples (compatibilidade do egg)', async ({ page }) => {
  await page.goto('/pt-BR/locais/outback-steakhouse');
  await expect(page.getByRole('heading', { level: 1, name: 'Outback Steakhouse' })).toBeVisible();

  const favorito = page.getByRole('button', { name: /^Favoritar \(/ });
  for (let toque = 1; toque <= 13; toque += 1) {
    await favorito.click();
  }
  await expect(page.getByText('Combo Sexta-feira 13 Sem Sustos')).toBeVisible();

  // Linguagem simples reescreve o item secreto sem quebrar o cardápio
  await page.getByRole('button', { name: /Linguagem simples/ }).click();
  await expect(
    page.getByText('Combo especial: hambúrguer, batata e bebida por treze reais. Sem sustos!'),
  ).toBeVisible();
  await expect(page.getByText('R$ 13,00')).toBeVisible();

  // volta ao texto normal
  await page.getByRole('button', { name: /Linguagem simples/ }).click();
  await expect(page.getByText('Combo Sexta-feira 13 Sem Sustos')).toBeVisible();
});
