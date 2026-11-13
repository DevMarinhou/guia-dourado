import type { MetadataRoute } from 'next';

// PWA (RF-28). TODO: ícones 192/512 px e Service Worker (Serwist) com pré-cache de dados e plantas.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Guia Dourado: acessibilidade no Capim Dourado Shopping',
    short_name: 'Guia Dourado',
    description: 'Mapa, rotas acessíveis, comunicação e ajuda no Capim Dourado Shopping.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b4f8a',
    lang: 'pt-BR',
    dir: 'ltr',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  };
}
