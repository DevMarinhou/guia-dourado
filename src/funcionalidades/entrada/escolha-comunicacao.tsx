'use client';

// Porta de entrada do app: "Como você prefere se comunicar?" — por voz ou por toque.
// Cada resposta abre a ferramenta que ajuda aquela pessoa:
//   🔊 Voz    → guia por câmera (/guia, já no modo voz) — pessoa cega ou com baixa visão
//   🤟 Libras → Conversar (/conversar) com o VLibras ligado — pessoa surda
//   🖼️ Cards  → Prancha de pictogramas (/prancha) — quem não fala / prefere figuras
// O som só pode tocar depois de um toque (regra dos navegadores), por isso a pergunta falada
// começa no botão "Toque aqui para eu perguntar em voz alta".
import { useState } from 'react';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar } from '@/adaptadores/voz/web-speech';
import { ativarVLibras } from '@/adaptadores/libras/vlibras';
import { Link, useRouter } from '@/i18n/navigation';
import { contemAlguma, escutaDisponivel, normalizarFala, ouvirUmaVez } from '@/funcionalidades/farol/escuta';
import '@/funcionalidades/farol/guia.css';

export type TextosEntrada = Record<
  | 'titulo' | 'perguntarVoz' | 'f_pergunta' | 'f_naoEntendi' | 'ouvindo' | 'voz' | 'vozDesc' | 'libras'
  | 'librasDesc' | 'cards' | 'cardsDesc' | 'abrindo' | 'palavrasVoz' | 'palavrasLibras' | 'palavrasCards',
  string
>;

type Opcao = 'voz' | 'libras' | 'cards';

export function EscolhaComunicacao({ textos: t, idioma }: { textos: TextosEntrada; idioma: string }) {
  const router = useRouter();
  const anunciarAria = useAnunciador();
  const [ouvindo, setOuvindo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  function dizer(texto: string, aoTerminar?: () => void) {
    setAviso(texto);
    anunciarAria(texto, 'polite');
    falar(texto, idioma, aoTerminar);
  }

  async function abrirLibras() {
    setAviso(t.abrindo);
    await ativarVLibras(); // o widget fica na página e acompanha a navegação
    router.push('/conversar');
  }

  function escolher(o: Opcao) {
    if (o === 'voz') router.push('/guia?modo=voz');
    else if (o === 'cards') router.push('/prancha');
    else void abrirLibras();
  }

  function perguntar() {
    dizer(t.f_pergunta, async () => {
      if (!escutaDisponivel()) return;
      setOuvindo(true);
      const bruto = await ouvirUmaVez(idioma);
      setOuvindo(false);
      if (!bruto) return; // sem fala: os cartões continuam na tela
      const fala = normalizarFala(bruto, []);
      if (contemAlguma(fala, t.palavrasLibras, [])) escolher('libras');
      else if (contemAlguma(fala, t.palavrasCards, [])) escolher('cards');
      else if (contemAlguma(fala, t.palavrasVoz, [])) escolher('voz');
      else dizer(t.f_naoEntendi);
    });
  }

  const classeCartao =
    'guia-vidro alvo grid h-full min-h-24 grid-cols-[auto_1fr] items-center gap-x-4 rounded-3xl p-4 text-left sm:min-h-36 sm:grid-cols-1 sm:justify-items-center sm:text-center';

  return (
    <section aria-labelledby="entrada-titulo" className="guia-raiz space-y-3">
      <h2 id="entrada-titulo" className="text-2xl font-bold">
        {t.titulo}
      </h2>
      <button
        type="button"
        onClick={perguntar}
        disabled={ouvindo}
        className="guia-bordaOuro alvo flex w-full items-center justify-center gap-3 rounded-full border-2 bg-primaria px-5 py-4 text-lg font-bold text-primaria-texto"
      >
        <span aria-hidden="true" className="text-2xl">
          {ouvindo ? '🎙️' : '🔊'}
        </span>
        {ouvindo ? t.ouvindo : t.perguntarVoz}
      </button>
      {aviso && <p className="guia-ouro text-center font-bold">{aviso}</p>}
      <ul className="grid gap-3 sm:grid-cols-3">
        <li>
          <Link href="/guia?modo=voz" className={classeCartao}>
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
          <Link href="/prancha" className={classeCartao}>
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
