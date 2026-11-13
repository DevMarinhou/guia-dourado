import type { z } from 'zod';
import type {
  esquemaAresta,
  esquemaEquipamento,
  esquemaGrafo,
  esquemaIdioma,
  esquemaLocal,
  esquemaNo,
  esquemaPisoId,
  esquemaPonto,
} from './esquemas';

export type Idioma = z.infer<typeof esquemaIdioma>;
export type PisoId = z.infer<typeof esquemaPisoId>;
export type No = z.infer<typeof esquemaNo>;
export type Aresta = z.infer<typeof esquemaAresta>;
export type TipoAresta = Aresta['tipo'];
export type Grafo = z.infer<typeof esquemaGrafo>;
export type Local = z.infer<typeof esquemaLocal>;
export type Ponto = z.infer<typeof esquemaPonto>;
export type Equipamento = z.infer<typeof esquemaEquipamento>;

/** Perfis de rota (Cap. 10.4). São preferências funcionais, não diagnósticos. */
export type PerfilRota = 'padrao' | 'sem_degraus' | 'mobilidade_reduzida' | 'visual' | 'sensorial';

export interface OpcoesRota {
  perfil: PerfilRota;
  /** Equipamentos em manutenção ou fora de serviço (RN-02). */
  equipamentosInativos?: ReadonlySet<string>;
  /** Com carrinho de bebê, escada rolante é proibida. */
  comCarrinhoDeBebe?: boolean;
  /** Nós em zonas ruidosas (perfil sensorial). */
  zonasRuidosas?: ReadonlySet<string>;
}

export interface TrechoRota {
  aresta: Aresta;
  de: No;
  para: No;
}

export type ResultadoRota =
  | { ok: true; trechos: TrechoRota[]; distanciaM: number; minutos: number; custo: number }
  | { ok: false; motivo: 'sem_caminho' | 'origem_invalida' | 'destino_invalido' };
