import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaPedirAjuda } from '@/funcionalidades/ajuda/tela-pedir-ajuda';
import type { Idioma } from '@/dominio/tipos';
import { pontos } from '@/lib/dados';

// T08: Pedir ajuda (RF-19, RF-20). Formulário em 2 etapas com consentimento LGPD,
// enviando para POST /api/ajuda; os números de emergência (192/193/190) ficam sempre
// visíveis acima do formulário.
export async function generateMetadata({ params }: PageProps<'/[locale]/ajuda'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.T08' });
  return { title: t('titulo') };
}

async function Conteudo({ params }: { params: PageProps<'/[locale]/ajuda'>['params'] }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T08');
  const e = await getTranslations('emergencia');

  return (
    <>
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>

      <section aria-labelledby="emergencia" className="rounded-xl border-2 border-perigo p-4">
        <h2 id="emergencia" className="mb-3 text-xl font-bold">
          {e('titulo')}
        </h2>
        <ul className="grid grid-cols-3 gap-2">
          {[
            { tel: '192', rotulo: e('samu') },
            { tel: '193', rotulo: e('bombeiros') },
            { tel: '190', rotulo: e('policia') },
          ].map((n) => (
            <li key={n.tel}>
              <a href={`tel:${n.tel}`} className="alvo flex items-center justify-center rounded-lg bg-perigo p-3 text-center font-bold text-perigo-texto">
                {n.rotulo}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <TelaPedirAjuda
        pontos={pontos.map((p) => ({ codigo: p.codigo, nome: p.nome }))}
        idioma={locale as Idioma}
      />
    </>
  );
}

export default function PaginaAjuda({ params }: PageProps<'/[locale]/ajuda'>) {
  return (
    <div className="space-y-4">
      {/* params dentro de <Suspense>: navegação instantânea (Next.js 16, como em rota). */}
      <Suspense fallback={null}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}
