/** Fila de prioridade mínima (heap binário) com inserção "preguiçosa" para o Dijkstra. */
export class HeapMinimo<T> {
  private itens: { valor: T; prioridade: number }[] = [];

  get tamanho(): number {
    return this.itens.length;
  }

  inserir(valor: T, prioridade: number): void {
    this.itens.push({ valor, prioridade });
    let i = this.itens.length - 1;
    while (i > 0) {
      const pai = (i - 1) >> 1;
      if (this.itens[pai]!.prioridade <= this.itens[i]!.prioridade) break;
      [this.itens[pai], this.itens[i]] = [this.itens[i]!, this.itens[pai]!];
      i = pai;
    }
  }

  remover(): { valor: T; prioridade: number } | undefined {
    if (this.itens.length === 0) return undefined;
    const topo = this.itens[0]!;
    const ultimo = this.itens.pop()!;
    if (this.itens.length > 0) {
      this.itens[0] = ultimo;
      let i = 0;
      for (;;) {
        const esq = 2 * i + 1;
        const dir = esq + 1;
        let menor = i;
        if (esq < this.itens.length && this.itens[esq]!.prioridade < this.itens[menor]!.prioridade) menor = esq;
        if (dir < this.itens.length && this.itens[dir]!.prioridade < this.itens[menor]!.prioridade) menor = dir;
        if (menor === i) break;
        [this.itens[menor], this.itens[i]] = [this.itens[i]!, this.itens[menor]!];
        i = menor;
      }
    }
    return topo;
  }
}
