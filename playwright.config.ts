import { defineConfig, devices } from '@playwright/test';

// E2E + acessibilidade automatizada (Cap. 12). Rode com: npm run test:e2e
// Em ambientes com Chromium pré-instalado em outro caminho, defina PW_CHROMIUM_PATH.
const executablePath = process.env.PW_CHROMIUM_PATH;
const porta = Number(process.env.PORTA_E2E ?? 3123);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? `http://localhost:${porta}`,
    trace: 'off',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'android-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: `npx next start -p ${porta}`, port: porta, reuseExistingServer: true, timeout: 120_000 },
});
