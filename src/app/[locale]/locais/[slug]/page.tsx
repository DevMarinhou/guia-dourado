import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { Idioma } from '@/dominio/tipos';
import { buscarLocalPorSlug, locais } from '@/lib/dados';
import { DetalheLocal } from '@/funcionalidades/detalhe/detalhe-local';

// T04: Detalhe do local (RF-10). Página estática por local e por idioma (generateStaticParams).
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => locais.map((l) => ({ locale, slug: l.slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/locais/[slug]'>) {
  const { slug } = await params;
  const local = buscarLocalPorSlug(slug);
  return { title: local ? `${local.nome} — ${local.numero}` : 'Local' };
}

export default async function PaginaLocal({ params }: PageProps<'/[locale]/locais/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const local = buscarLocalPorSlug(slug);
  if (!local) notFound();
  const tp = await getTranslations('pisos');
  const tl = await getTranslations('local');
  const tc = await getTranslations('comum');
  const idioma = locale as Idioma;

  return (
    <DetalheLocal
      local={{
        slug: local.slug,
        locale,
        nome: local.nome,
        numero: local.numero,
        pisoNome: tp(local.pisoId as 'terreo'),
        categoria: local.categoria,
        areaM2: local.areaM2 ?? undefined,
        descricao: local.textos?.[idioma]?.descricao,
        simples: local.textos?.[idioma]?.simples,
        ruido: local.sensorial?.ruido,
        acessibilidade: local.acessibilidade ?? undefined,
      }}
      textos={{
        comoChegar: tl('comoChegar'),
        naoInformado: tl('naoInformado'),
        area: tl('area'),
        cardapio: tl('cardapio'),
        favoritar: tl('favoritar'),
        dicasToques: [3, 2, 1].map((n) => tl('dicaToques', { n })) as [string, string, string],
        ovosTitulo: tl('ovosTitulo'),
        itemSecreto: tl('itemSecreto'),
        precoSecreto: tl('precoSecreto'),
        itemSecretoSimples: tl('itemSecretoSimples'),
        linguagemSimples: tl('linguagemSimples'),
        recursos: tl('recursos'),
        recursoSanitarioPne: tl('recursoSanitarioPne'),
        ruido: tl('ruido'),
        rotulosRuido: { baixo: tl('ruidoBaixo'), medio: tl('ruidoMedio'), alto: tl('ruidoAlto') },
        sim: tl('sim'),
        nao: tl('nao'),
        ouvir: tc('ouvir'),
        libras: tc('libras'),
      }}
    />
  );
}
