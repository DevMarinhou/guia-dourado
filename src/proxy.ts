// Next.js 16: "proxy.ts" substitui "middleware.ts". Aqui só negociamos o idioma (next-intl).
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Não passa pelo proxy: API, resolvedor de QR (/q), Central, totem, arquivos internos e estáticos.
  matcher: ['/((?!api|q/|central|totem|_next|_vercel|.*\\..*).*)'],
};
