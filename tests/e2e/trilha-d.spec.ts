import { expect, test } from '@playwright/test';

// Trilha D: fluxo completo de pedido de ajuda (T08 → T09 → T12 Central).
test('visitante pede ajuda, acompanha e a Central atende', async ({ page }) => {
  await page.goto('/pt-BR/ajuda');
  await expect(page.getByRole('heading', { level: 1, name: 'Pedir ajuda' })).toBeVisible();

  // etapa 1: tipo + modo
  await page.getByLabel('Saúde').check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // etapa 2: local + consentimento (obrigatório)
  await page.locator('select').selectOption('LOJA-32');
  // observação única identifica este pedido na fila (podem haver pedidos de outros testes)
  const marca = `e2e-${Date.now()}`;
  await page.locator('textarea').fill(marca);
  const enviar = page.getByRole('button', { name: 'Enviar pedido' });
  await expect(enviar).toBeDisabled();
  await page.locator('input[type="checkbox"]').check();
  await expect(enviar).toBeEnabled();
  await enviar.click();

  // T09: abre com token e status inicial
  await expect(page).toHaveURL(/\/ajuda\/[0-9a-f-]+\?token=/);
  await expect(page.getByRole('heading', { level: 1, name: 'Seu pedido de ajuda' })).toBeVisible();
  const status = page.getByRole('status').first();
  await expect(status).toHaveText(/Aguardando a equipe|Aceito/, { timeout: 10000 });

  // T12: a fila mostra o pedido novo e a Central atende
  await page.goto('/central');
  await expect(page.getByRole('heading', { level: 1, name: 'Central da equipe' })).toBeVisible();
  await expect(page.getByText('Modo demonstração')).toBeVisible();
  const card = page.locator('[aria-labelledby="fila"] li').filter({ hasText: marca }).first();
  await expect(card).toBeVisible({ timeout: 10000 });
  await expect(card.getByText('Prioridade 1')).toBeVisible();
  // fluxo do atendente: aceitar → a caminho
  await card.getByRole('button', { name: /Aceitar/ }).click();
  await card.getByRole('button', { name: /A caminho/ }).click({ timeout: 15000 });

  // T09: o polling (5 s) reflete a mudança
  await page.goBack();
  await expect(status).toHaveText(/a caminho/i, { timeout: 15000 });

  // cancelamento pelo visitante com token
  await page.getByRole('button', { name: 'Cancelar pedido' }).click();
  await expect(status).toHaveText(/Cancelado/, { timeout: 10000 });
});
