import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';

// T08: Pedir ajuda (RF-19, RF-20). Números de emergência já funcionam (links tel:).
// TODO(RF-19): formulário em 2 etapas (tipo → confirmar local e modo de comunicação + consentimento),
// enviando para POST /api/ajuda (esquemaNovoPedidoAjuda).
export default async function PaginaAjuda({ params }: PageProps<'/[locale]/ajuda'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T08');
  const e = await getTranslations('emergencia');

  return (
    <TelaEmConstrucao id="T08" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-19', 'RF-20']}>
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
    </TelaEmConstrucao>
  );
}
