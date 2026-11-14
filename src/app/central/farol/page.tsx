import { TreinoPercurso } from '@/funcionalidades/farol/treino-percurso';
import { percursoPiloto } from '@/lib/dados';

// instant = false: rota sempre dinâmica, como a Central (o layout de /central usa getMessages).
export const instant = false;

export const metadata = { title: 'Treino do percurso (Farol)' };

// Ferramenta interna da equipe: gera a base visual do guia por câmera a partir do vídeo narrado.
export default function PaginaTreinoFarol() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Treino do percurso (Farol)</h1>
      <p className="text-texto-suave">
        Transforme o vídeo narrado em uma base que a câmera usa para reconhecer cada ponto. Tudo é processado neste
        navegador; nenhuma imagem é enviada.
      </p>
      <TreinoPercurso
        idsDosPontos={percursoPiloto.pontos.map((p) => p.id)}
        nomePercurso={percursoPiloto.nome['pt-BR']}
      />
    </div>
  );
}
