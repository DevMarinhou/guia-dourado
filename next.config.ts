import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const comNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Mantém navegações e Server Actions pendentes enquanto a rede cai e repete quando volta
    // (guia "offline-support" do Next.js 16.4). Use o hook useOffline() de 'next/offline'.
    useOffline: true,
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Câmera (escanear outro QR) e microfone (legenda ao vivo) só para o próprio site.
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
          // TODO(segurança): Content-Security-Policy com nonce, liberando vlibras.gov.br e o Supabase.
        ],
      },
    ];
  },
};

export default comNextIntl(nextConfig);
