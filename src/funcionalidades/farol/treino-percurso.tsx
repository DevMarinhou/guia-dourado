'use client';
/**
 * Farol — Treino da base visual (uso da equipe).
 * Vídeo narrado do percurso + marcações de tempo → quadros etiquetados →
 * impressões digitais (MediaPipe) → base-corredor.json.
 * Não é treinar uma rede do zero: é "ensinar por exemplos" (busca por semelhança).
 */
import { useRef, useState } from "react";
import { carregarEmbedder, embedQuadro } from './embedder';
import {
  carregarBase,
  lerMarcacoes,
  palpitar,
  quantizar,
  rotuloNoTempo,
  type BaseVisual,
} from '@/dominio/farol/reconhecer';
import { apagarBaseLocal, salvarBaseLocal } from './base-visual';

const QUADROS_POR_SEGUNDO = 2;

const ROTULO_TRANSICAO = '-';

function esperarSeek(v: HTMLVideoElement, t: number) {
  return new Promise<void>((ok) => {
    const fim = () => {
      v.removeEventListener("seeked", fim);
      ok();
    };
    v.addEventListener("seeked", fim);
    v.currentTime = t;
  });
}

export function TreinoPercurso({ idsDosPontos, nomePercurso }: { idsDosPontos: string[]; nomePercurso: string }) {
  const EXEMPLO = [
    "# m:ss id-do-ponto  (vale até a próxima linha; '-' = transição)",
    ...idsDosPontos.map((id, i) => `0:${String(i * 7).padStart(2, '0')} ${id}`),
  ].join('\n');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [marcacoes, setMarcacoes] = useState(EXEMPLO);
  const [progresso, setProgresso] = useState("");
  const [base, setBase] = useState<BaseVisual | null>(null);
  const [resumo, setResumo] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(false);

  async function treinar() {
    if (!arquivo) return setProgresso("Escolha o vídeo primeiro.");
    let marcas;
    try {
      marcas = lerMarcacoes(marcacoes);
    } catch (e) {
      return setProgresso((e as Error).message);
    }
    const idsValidos = new Set([...idsDosPontos, ROTULO_TRANSICAO]);
    const desconhecidos = marcas.map((m) => m.rotulo).filter((r) => !idsValidos.has(r));
    if (desconhecidos.length) {
      return setProgresso(
        `Pontos não cadastrados em dados/percurso-piloto.json: ${[...new Set(desconhecidos)].join(", ")}`,
      );
    }

    setOcupado(true);
    try {
      setProgresso("Carregando o modelo de imagem…");
      const emb = await carregarEmbedder();
      const v = videoRef.current!;
      const c = canvasRef.current!;
      v.src = URL.createObjectURL(arquivo);
      v.muted = true;
      await new Promise<void>((ok) => v.addEventListener("loadedmetadata", () => ok(), { once: true }));
      const duracao = v.duration;
      const rotulos = [...idsValidos];
      const itens: BaseVisual["itens"] = [];
      const contagem = new Map<string, number>();
      const passo = 1 / QUADROS_POR_SEGUNDO;
      for (let t = 0; t < duracao; t += passo) {
        const rotulo = rotuloNoTempo(marcas, t);
        if (!rotulo) continue;
        await esperarSeek(v, t);
        c.width = 224;
        c.height = Math.round((224 * v.videoHeight) / Math.max(1, v.videoWidth)) || 224;
        c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
        const vetor = embedQuadro(emb, c);
        if (!vetor) continue;
        itens.push({ r: rotulos.indexOf(rotulo), v: quantizar(vetor) });
        contagem.set(rotulo, (contagem.get(rotulo) ?? 0) + 1);
        setProgresso(`Processando ${Math.round((t / duracao) * 100)}% · ${itens.length} quadros`);
      }
      const nova: BaseVisual = {
        versao: 1,
        percurso: nomePercurso,
        criadoEm: new Date().toISOString(),
        dimensao: itens.length ? atob(itens[0]?.v ?? '').length : 0,
        rotulos,
        itens,
      };
      setBase(nova);

      // autoteste: cada quadro contra os OUTROS (sem ele mesmo) — só um indicativo
      const carregada = carregarBase(nova);
      let acertos = 0;
      let avaliados = 0;
      carregada.vetores.forEach((vet, i) => {
        const certo = rotulos[carregada.indices[i] ?? -1];
        if (certo === undefined || certo === ROTULO_TRANSICAO) return;
        const semEle: typeof carregada = {
          ...carregada,
          vetores: carregada.vetores.filter((_, j) => Math.abs(j - i) > 2),
          indices: carregada.indices.filter((_, j) => Math.abs(j - i) > 2),
        };
        const p = palpitar(semEle, vet);
        avaliados++;
        if (p.rotulo === certo) acertos++;
      });
      setResumo([
        ...[...contagem].map(([r, n]) => `${r}: ${n} quadros`),
        `Autoteste (indicativo, não é validação real): ${avaliados ? Math.round((acertos / avaliados) * 100) : 0}% de ${avaliados} quadros`,
      ]);
      const salvo = salvarBaseLocal(nova);
      setProgresso(
        salvo
          ? "Pronto! Base salva neste aparelho. Abra o Guia por câmera para testar."
          : "Pronto! Base grande demais para salvar no aparelho: baixe o arquivo.",
      );
    } catch (e) {
      setProgresso(`Erro: ${(e as Error).message}`);
    } finally {
      setOcupado(false);
    }
  }

  function baixar() {
    if (!base) return;
    const blob = new Blob([JSON.stringify(base)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "base-corredor.json";
    a.click();
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-xl border border-borda p-4" aria-labelledby="passo1">
        <h2 id="passo1" className="mb-2 text-xl font-bold">1. Vídeo narrado do percurso</h2>
        <p className="mb-3 text-sm">
          Celular na altura do peito, andando devagar, ida e volta, parando ~10 s em cada ponto.
        </p>
        <input
          type="file"
          accept="video/*"
          aria-label="Escolher vídeo do percurso"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="alvo w-full rounded-xl border-2 border-borda p-2"
        />
      </section>

      <section className="rounded-xl border border-borda p-4" aria-labelledby="passo2">
        <h2 id="passo2" className="mb-2 text-xl font-bold">2. Marcações (tempo → ponto)</h2>
        <p className="mb-2 text-sm">
          Pontos cadastrados: {idsDosPontos.join(", ")} · use “-” para
          transição.
        </p>
        <label htmlFor="marcacoes" className="sr-only">Marcações</label>
        <textarea
          id="marcacoes"
          value={marcacoes}
          onChange={(e) => setMarcacoes(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-borda bg-superficie p-2 font-mono text-sm"
        />
      </section>

      <section className="rounded-xl border border-borda p-4" aria-labelledby="passo3">
        <h2 id="passo3" className="mb-2 text-xl font-bold">3. Treinar</h2>
        <div className="flex flex-wrap gap-2">
          <button className="alvo rounded-xl bg-primaria px-4 font-bold text-primaria-texto" onClick={treinar} disabled={ocupado}>
            {ocupado ? "⏳ Treinando…" : "🧠 Gerar base visual"}
          </button>
          <button className="alvo rounded-xl border-2 border-borda px-4 font-bold" onClick={baixar} disabled={!base}>
            ⬇️ Baixar base-corredor.json
          </button>
          <button
            className="alvo rounded-xl px-4 font-bold underline"
            onClick={() => {
              apagarBaseLocal();
              setProgresso("Base local apagada. O guia volta a usar a base publicada.");
            }}
          >
            🗑️ Apagar base deste aparelho
          </button>
        </div>
        <p role="status" className="mt-3 font-bold">{progresso}</p>
        {resumo.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {resumo.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm opacity-80">
          Para publicar para todos: coloque o arquivo baixado em <code>public/farol/base-corredor.json</code> (ids dos pontos em <code>dados/percurso-piloto.json</code>).
        </p>
      </section>

      <video ref={videoRef} hidden playsInline muted />
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
