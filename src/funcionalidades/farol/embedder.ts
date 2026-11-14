'use client';
/**
 * Carrega o MediaPipe Image Embedder (MobileNet V3 Small) no navegador.
 * Roda no aparelho: nenhuma imagem sai do celular.
 * Dependência: @mediapipe/tasks-vision (versão fixa no package.json).
 */
import type { ImageEmbedder } from '@mediapipe/tasks-vision';

// Servidos pelo próprio app (public/mediapipe): funciona sem depender de CDN.
// Origem: node_modules/@mediapipe/tasks-vision@0.10.21/wasm e o modelo oficial
// mobilenet_v3_small (float32) do Google AI Edge.
const WASM = '/mediapipe';
const MODELO = '/mediapipe/mobilenet_v3_small.tflite';

let promessa: Promise<ImageEmbedder> | null = null;

export function carregarEmbedder(): Promise<ImageEmbedder> {
  if (!promessa) {
    promessa = (async () => {
      const { FilesetResolver, ImageEmbedder } = await import('@mediapipe/tasks-vision');
      const arquivos = await FilesetResolver.forVisionTasks(WASM);
      return ImageEmbedder.createFromOptions(arquivos, {
        baseOptions: { modelAssetPath: MODELO },
        runningMode: 'IMAGE',
        l2Normalize: true,
        quantize: false,
      });
    })();
    promessa.catch(() => {
      promessa = null;
    });
  }
  return promessa;
}

// Farol: MediaPipe Image Embedder (MobileNet V3 Small) no navegador; nenhuma imagem sai do aparelho.
/** Gera a 'impressão digital' de um quadro (vídeo, canvas ou imagem). */
export function embedQuadro(
  emb: ImageEmbedder,
  fonte: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
): Float32Array | null {
  const r = emb.embed(fonte);
  const v = r.embeddings[0]?.floatEmbedding;
  return v ? Float32Array.from(v) : null;
}
