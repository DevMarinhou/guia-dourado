import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GuiaCamera, type PontoGuia, type TextosGuia } from '@/funcionalidades/farol/guia-camera';
import type { Idioma } from '@/dominio/tipos';
import { percursoPiloto } from '@/lib/dados';

// Farol: guia por câmera para pessoas cegas (piloto no corredor da faculdade).
// Reconhece o ponto pela câmera (base visual do vídeo narrado) e guia por passos até o destino.
export async function generateMetadata({ params }: PageProps<'/[locale]/guia'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'telas.guia' });
  return { title: t('titulo') };
}

const CHAVES = [
  'percurso', 'comecar', 'demo', 'ondeEstou', 'parar', 'paraOnde', 'situacao', 'pontoReconhecido', 'destino',
  'faltam', 'passos', 'contadorDesligado', 'unidade', 'tecnico', 'base', 'semAnalise', 'aviso', 'imagemCamera',
  'f_inicio', 'f_preparando', 'f_semBase', 'f_semModelo', 'f_cameraLigada', 'f_semCamera', 'f_demo', 'f_parado',
  'f_voceEsta', 'f_esquerda', 'f_direita', 'f_trecho', 'f_naoSei', 'f_destino', 'f_destinoSemPosicao', 'f_faltam',
  'f_chegando', 'f_chegouCamera', 'f_chegouPassos', 'f_perigo', 'f_semMovimento', 'f_movimentoNegado',
  'f_proximo', 'f_proximoEsquerda', 'f_proximoDireita', 'f_ficouPraTras', 'f_passou', 'f_contramao',
  'f_vireEsquerda', 'f_vireDireita', 'simulados', 'f_frente', 'f_virarEm', 'f_virarEmFrente', 'f_virarAgora',
  'ladoEsquerda', 'ladoDireita',
] as const satisfies readonly (keyof TextosGuia)[];

export default async function Pagina({ params }: PageProps<'/[locale]/guia'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('telas.guia');
  const idioma = locale as Idioma;
  const traduzir = (x?: Partial<Record<Idioma, string>>) => (x ? (x[idioma] ?? x['pt-BR']) : undefined);

  // ICU do next-intl trata {chaves}; usamos t.raw para manter os modelos e preencher no cliente.
  const textos = Object.fromEntries(CHAVES.map((k) => [k, t.raw(k) as string])) as TextosGuia;
  const pontos: PontoGuia[] = percursoPiloto.pontos.map((p) => ({
    id: p.id,
    passos: p.passos,
    destino: p.destino,
    trecho: p.trecho,
    perigo: p.perigo ? 'sim' : undefined,
    nome: traduzir(p.nome) ?? p.id,
    esquerda: traduzir(p.esquerda),
    direita: traduzir(p.direita),
    frente: traduzir(p.frente),
    virar: p.virar,
    reconhecidoA: p.reconhecidoA,
    perigoTexto: traduzir(p.perigo),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('titulo')}</h1>
      <p className="text-texto-suave">{t('objetivo')}</p>
      <GuiaCamera
        pontos={pontos}
        nomePercurso={traduzir(percursoPiloto.nome) ?? ''}
        idioma={locale}
        textos={textos}
      />
    </div>
  );
}
