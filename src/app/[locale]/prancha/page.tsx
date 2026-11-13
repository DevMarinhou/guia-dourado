import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TelaEmConstrucao } from '@/componentes/tela-em-construcao';
import type { Idioma } from '@/dominio/tipos';
import { prancha } from '@/lib/dados';

// T07: Prancha de comunicação (RF-18). A grade já vem dos dados; falta a interação (falar, montar frase).
export default async function PaginaPrancha({ params }: PageProps<'/[locale]/prancha'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.T07');
  const idioma = locale as Idioma;

  return (
    <TelaEmConstrucao id="T07" titulo={t('titulo')} objetivo={t('objetivo')} requisitos={['RF-18']}>
      {prancha.map((cat) => (
        <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
          <h2 id={`cat-${cat.id}`} className="mb-2 text-xl font-bold">
            {cat.nome[idioma]}
          </h2>
          <ul className="grid grid-cols-3 gap-2">
            {cat.itens.map((item) => (
              <li key={item.id}>
                {/* TODO: botão que fala item.frase[idioma] e mostra em destaque (Client Component). */}
                <div className="flex min-h-20 flex-col items-center justify-center rounded-lg border-2 border-borda p-2 text-center text-sm">
                  <span aria-hidden="true" className="text-2xl">
                    {item.emoji}
                  </span>
                  {item.rotulo[idioma]}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </TelaEmConstrucao>
  );
}
