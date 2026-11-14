import { TelaCentral } from '@/funcionalidades/central/tela-central';

// T12: Central da equipe (RF-22, RF-23). Área interna em pt-BR, fora de [locale].
// instant = false: a rota é sempre dinâmica (fila em tempo real + getMessages no layout).
export const instant = false;

export const metadata = {
  title: 'Central da equipe',
  robots: { index: false, follow: false },
};

export default function PaginaCentral() {
  return <TelaCentral dicaChave={Boolean(process.env.CENTRAL_CHAVE)} />;
}
