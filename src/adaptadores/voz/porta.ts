// Portas de voz (ADR-0009). As telas dependem destas interfaces, não do navegador.
export interface ProvedorFala {
  disponivel(): boolean;
  falar(texto: string, idioma: string, aoTerminar?: () => void): void;
  parar(): void;
}

export interface ProvedorEscuta {
  disponivel(): boolean;
  /** Inicia a legenda ao vivo; o áudio NÃO é gravado (RNF-05). */
  iniciar(idioma: string, aoReceber: (texto: string, final: boolean) => void, aoErro?: (erro: string) => void): void;
  parar(): void;
}
