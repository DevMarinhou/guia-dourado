'use client';

import { useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const CHAVE = 'gd:ponto';

function lerPontoSalvo(): string | null {
  try {
    return sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

interface Props {
  nomesDosPontos: Record<string, string>;
  textos: { voceEstaEm: string; escolherLocal: string; semLocal: string };
}

/** Mostra "Você está em…" a partir do QR (?ponto=) ou do último ponto da sessão (RF-01, RF-02). */
export function CartaoLocalizacao({ nomesDosPontos, textos }: Props) {
  const daUrl = useSearchParams().get('ponto');
  const salvo = useSyncExternalStore(
    () => () => {},
    lerPontoSalvo,
    () => null,
  );
  const codigo = daUrl && nomesDosPontos[daUrl] ? daUrl : salvo;
  if (daUrl && nomesDosPontos[daUrl]) {
    try {
      sessionStorage.setItem(CHAVE, daUrl);
    } catch {
      // armazenamento indisponível (modo privado): segue sem salvar
    }
  }
  const nome = codigo ? nomesDosPontos[codigo] : undefined;

  return (
    <section aria-label={textos.voceEstaEm} className="rounded-xl border-2 border-ajuda p-4">
      {nome ? (
        <>
          <p className="font-bold">{textos.voceEstaEm}</p>
          <p className="text-lg">{nome}</p>
        </>
      ) : (
        <p>{textos.semLocal}</p>
      )}
      {/* TODO(RF-02): lista "Onde estou?" com busca entre os pontos de referência. */}
      <p className="mt-2 text-sm underline">{textos.escolherLocal}</p>
    </section>
  );
}
