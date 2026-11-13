import { getTranslations } from 'next-intl/server';

interface Props {
  id: string;
  titulo: string;
  objetivo: string;
  requisitos: string[];
  children?: React.ReactNode;
}

/** Estrutura padrão das telas ainda não implementadas: título único, objetivo e requisitos (Cap. 4 e 5). */
export async function TelaEmConstrucao({ id, titulo, objetivo, requisitos, children }: Props) {
  const t = await getTranslations('comum');
  return (
    <article aria-labelledby="titulo-tela" className="space-y-4">
      <h1 id="titulo-tela" className="text-2xl font-bold">
        {titulo}
      </h1>
      <p>{objetivo}</p>
      {children}
      <aside className="rounded-lg border border-dashed border-borda p-3 text-sm text-texto-suave">
        <p>
          <strong>{id}</strong> · {t('emConstrucao')}
        </p>
        <p>
          {t('requisitos')}: {requisitos.join(', ')}
        </p>
      </aside>
    </article>
  );
}
