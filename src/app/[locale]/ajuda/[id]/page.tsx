import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';

// T09: Acompanhar pedido (RF-21). O id do pedido só existe em tempo de execução, então a leitura
// dos parâmetros fica dentro de <Suspense> (Cache Components do Next.js 16).
// TODO(RF-21): Client Component com polling a cada 5 s em GET /api/ajuda/[id]?token=… e anúncios aria-live.
async function Conteudo({ params }: { params: PageProps<'/[locale]/ajuda/[id]'>['params'] }) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T09' });
  return (
    <TelaEmConstrucao id="T09" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-21']}>
      <p>
        Pedido <strong>{id}</strong>
      </p>
    </TelaEmConstrucao>
  );
}

export default function PaginaPedido({ params }: PageProps<'/[locale]/ajuda/[id]'>) {
  return (
    <Suspense fallback={<p>Carregando o pedido…</p>}>
      <Conteudo params={params} />
    </Suspense>
  );
}
