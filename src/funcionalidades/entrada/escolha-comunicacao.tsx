'use client';

// Porta de entrada do app: "Como você prefere se comunicar?" — a MESMA esfera de voz do guia.
// Toque em QUALQUER lugar do palco → o Guia Dourado pergunta em voz alta (com legenda que acompanha
// a fala) e fica escutando, no próprio aparelho (Vosk; Web Speech se não der). Cada resposta abre a
// ferramenta certa:
//   🔊 Voz    → guia por câmera (/guia, já no modo voz) — pessoa cega ou com baixa visão
//   🤟 Libras → liga o VLibras (gov.br) aqui mesmo e abre o avatar — pessoa surda
//   🖼️ Cards  → Prancha de pictogramas (/prancha) — quem não fala / prefere figuras
// O som só pode tocar depois de um toque (regra dos navegadores), por isso começa no toque.
import { useEffect, useRef, useState } from 'react';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar, pararFala } from '@/adaptadores/voz/web-speech';
import { ativarVLibras } from '@/adaptadores/libras/vlibras';
import { Link, useRouter } from '@/i18n/navigation';
import { contemAlguma, normalizarFala } from '@/funcionalidades/farol/escuta';
import { criarEscutador, preCarregarEscuta, type Escutador } from '@/funcionalidades/farol/agente-voz';
import { velocidadeDaVoz } from '@/funcionalidades/farol/velocidade-voz';
import '@/funcionalidades/farol/guia.css';

export type TextosEntrada = Record<
  | 'titulo' | 'toqueIniciar' | 'f_pergunta' | 'f_naoEntendi' | 'ouvindo' | 'falando' | 'toqueRepetir'
  | 'voceDisse' | 'voz' | 'vozDesc' | 'libras' | 'librasDesc' | 'cards' | 'cardsDesc' | 'abrindo'
  | 'librasPronto' | 'librasErro' | 'palavrasVoz' | 'palavrasLibras' | 'palavrasCards' | 'gramatica',
  string
>;

type Opcao = 'voz' | 'libras' | 'cards';
type EstadoVoz = 'parado' | 'falando' | 'ouvindo';

export function EscolhaComunicacao({ textos: t, idioma }: { textos: TextosEntrada; idioma: string }) {
  const router = useRouter();
  const anunciarAria = useAnunciador();
  const escutadorRef = useRef<Escutador | null>(null);
  const falaIdRef = useRef(0);
  const fimDaFalaRef = useRef(0);
  const [estado, setEstado] = useState<EstadoVoz>('parado');
  const [volume, setVolume] = useState(0);
  /** legenda: o que o guia está falando + até onde já falou (para acompanhar a voz) */
  const [legenda, setLegenda] = useState<{ texto: string; dita: number } | null>(null);
  const [voceDisse, setVoceDisse] = useState<string | null>(null);

  // Ao sair da tela: solta o microfone e cala a voz.
  useEffect(
    () => () => {
      escutadorRef.current?.parar();
      pararFala();
    },
    [],
  );

  /** Fala com legenda. Pausa a escuta enquanto fala, para não ouvir a si mesmo. */
  function dizer(texto: string, aoTerminar?: () => void) {
    const id = ++falaIdRef.current;
    setLegenda({ texto, dita: 0 });
    anunciarAria(texto, 'polite');
    escutadorRef.current?.pausar();
    setEstado('falando');
    falar(
      texto,
      idioma,
      () => {
        if (id !== falaIdRef.current) return; // uma fala mais nova cancelou esta
        fimDaFalaRef.current = performance.now();
        setLegenda((l) => (l ? { ...l, dita: l.texto.length } : l));
        escutadorRef.current?.retomar();
        setEstado(escutadorRef.current ? 'ouvindo' : 'parado');
        aoTerminar?.();
      },
      velocidadeDaVoz(),
      (ate) => {
        if (id === falaIdRef.current) setLegenda((l) => (l ? { ...l, dita: ate } : l));
      },
    );
  }

  function soltarEscuta() {
    escutadorRef.current?.parar();
    escutadorRef.current = null;
    setEstado('parado');
  }

  /** Liga o VLibras (gov.br) nesta mesma página e abre o avatar, clicando no botão do próprio widget. */
  async function abrirLibras() {
    soltarEscuta();
    pararFala();
    setLegenda({ texto: t.abrindo, dita: 0 });
    if (!(await ativarVLibras())) {
      setLegenda({ texto: t.librasErro, dita: 0 });
      anunciarAria(t.librasErro, 'polite');
      return;
    }
    // O widget monta o botão de acesso alguns instantes depois de carregar.
    for (let i = 0; i < 25; i++) {
      const botao = document.querySelector<HTMLElement>('[vw-access-button]');
      if (botao && botao.childElementCount > 0) {
        botao.click();
        break;
      }
      await new Promise((r) => window.setTimeout(r, 200));
    }
    setLegenda({ texto: t.librasPronto, dita: 0 });
    anunciarAria(t.librasPronto, 'polite');
  }

  function escolher(o: Opcao) {
    if (o === 'libras') return void abrirLibras();
    soltarEscuta();
    pararFala();
    router.push(o === 'voz' ? '/guia?modo=voz' : '/prancha');
  }

  function aoOuvir(bruto: string) {
    if (performance.now() - fimDaFalaRef.current < 400) return; // eco do fim da própria fala
    setVoceDisse(bruto);
    const fala = normalizarFala(bruto, []);
    if (contemAlguma(fala, t.palavrasLibras, [])) escolher('libras');
    else if (contemAlguma(fala, t.palavrasCards, [])) escolher('cards');
    else if (contemAlguma(fala, t.palavrasVoz, [])) escolher('voz');
    else if (fala) dizer(t.f_naoEntendi);
  }
  const aoOuvirRef = useRef(aoOuvir);
  useEffect(() => {
    aoOuvirRef.current = aoOuvir;
  });

  async function ligarEscuta() {
    if (escutadorRef.current) return;
    const palavras = [t.palavrasVoz, t.palavrasLibras, t.palavrasCards, t.gramatica]
      .join(',')
      .split(/[\s,]+/)
      .filter(Boolean);
    const e = await criarEscutador({
      idioma,
      aoOuvir: (texto) => aoOuvirRef.current(texto),
      aoOuvirParcial: setVoceDisse,
      aoMudarVolume: setVolume,
      palavras,
    });
    escutadorRef.current = e;
    if (!e) return;
    // Se ainda está falando a pergunta, a escuta espera a fala acabar.
    if (window.speechSynthesis?.speaking) e.pausar();
    else setEstado('ouvindo');
  }

  /** Toque em qualquer lugar do palco: pergunta (ou repete a pergunta). */
  function tocarTela() {
    preCarregarEscuta(idioma);
    dizer(t.f_pergunta);
    void ligarEscuta();
  }

  const rotulo =
    estado === 'falando' ? t.falando : estado === 'ouvindo' ? t.ouvindo : legenda ? t.toqueRepetir : t.toqueIniciar;
  const classeCartao =
    'guia-vidro alvo grid h-full min-h-24 grid-cols-[auto_1fr] items-center gap-x-4 rounded-3xl p-4 text-left sm:min-h-36 sm:grid-cols-1 sm:justify-items-center sm:text-center';

  return (
    <section aria-labelledby="entrada-titulo" className="guia-raiz space-y-4">
      {/* PALCO: o bloco inteiro é o botão — quem não enxerga toca em qualquer lugar. */}
      <button
        type="button"
        onClick={tocarTela}
        className="guia-palco alvo flex min-h-[62vh] w-full flex-col items-center justify-between gap-5 rounded-[2rem] px-4 pt-8 pb-5 text-center"
      >
        <span className="flex flex-col items-center gap-5">
          <span id="entrada-titulo" className="text-2xl leading-tight font-bold sm:text-3xl">
            {t.titulo}
          </span>
          <span className={`guia-orb guia-orb-${estado}`} aria-hidden="true">
            <span className="guia-orb-anel" />
            <span className="guia-orb-anel" />
            <span className="guia-orb-ondas" style={{ ['--vol' as string]: String(0.35 + volume) }}>
              {Array.from({ length: 9 }, (_, k) => (
                <span key={k} className="guia-orb-barra" style={{ animationDelay: `${(k % 5) * 0.11}s` }} />
              ))}
            </span>
          </span>
          <span className="guia-ouro text-sm font-bold tracking-[0.2em] uppercase">{rotulo}</span>
          {voceDisse && estado !== 'falando' && (
            <span aria-hidden="true" className="rounded-full border border-borda px-4 py-1 text-sm">
              {t.voceDisse} “{voceDisse}”
            </span>
          )}
        </span>
        {/* LEGENDA: acompanha a voz, palavra por palavra (quando o aparelho informa). */}
        <span aria-hidden="true" className="guia-legenda block w-full max-w-xl px-2 pt-4 text-lg leading-snug sm:text-xl">
          {legenda ? (
            <>
              <span className="guia-legenda-dita font-bold">{legenda.texto.slice(0, legenda.dita)}</span>
              <span>{legenda.texto.slice(legenda.dita)}</span>
            </>
          ) : (
            <span className="text-texto-suave">{t.toqueIniciar}</span>
          )}
        </span>
      </button>

      {/* Para quem enxerga: também dá para tocar direto na opção. */}
      <ul className="grid gap-3 sm:grid-cols-3">
        <li>
          <Link href="/guia?modo=voz" onClick={soltarEscuta} className={classeCartao}>
            <span aria-hidden="true" className="row-span-2 text-5xl">
              🔊
            </span>
            <span className="text-xl font-bold">{t.voz}</span>
            <span className="text-sm text-texto-suave">{t.vozDesc}</span>
          </Link>
        </li>
        <li>
          <button type="button" onClick={() => void abrirLibras()} className={`${classeCartao} w-full`}>
            <span aria-hidden="true" className="row-span-2 text-5xl">
              🤟
            </span>
            <span className="text-xl font-bold">{t.libras}</span>
            <span className="text-sm text-texto-suave">{t.librasDesc}</span>
          </button>
        </li>
        <li>
          <Link href="/prancha" onClick={soltarEscuta} className={classeCartao}>
            <span aria-hidden="true" className="row-span-2 text-5xl">
              🖼️
            </span>
            <span className="text-xl font-bold">{t.cards}</span>
            <span className="text-sm text-texto-suave">{t.cardsDesc}</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
