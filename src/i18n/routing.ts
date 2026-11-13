import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt-BR', 'en', 'es'],
  defaultLocale: 'pt-BR',
  // pt-BR sem prefixo (/mapa/terreo); /en/... e /es/... para turistas.
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
