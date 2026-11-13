export type Local = {
  slug: string;
  nome: string;
  categoria: string;
  piso: string;
  areaM2?: number;
  horario: string;
  descricao: string;
  descricaoSimples: string;
  cardapio?: { item: string; preco: string; simples: string }[];
};

export const LOCAIS: Local[] = [
  {
    slug: "outback",
    nome: "Outback — Loja 104",
    categoria: "Alimentação",
    piso: "1º Pavimento (Térreo)",
    areaM2: 364,
    horario: "Seg–sáb 11h–23h · Dom 11h–22h",
    descricao:
      "Restaurante de inspiração australiana com pratos à base de carne, saladas e sobremesas. Localizado no 1º Pavimento, próximo à escada rolante.",
    descricaoSimples:
      "Restaurante de carne e saladas. Fica no piso de baixo, perto da escada.",
    cardapio: [
      {
        item: "Bloco On The Rock",
        preco: "R$ 32,90",
        simples: "Carne com queijo e bacon",
      },
      {
        item: "Ancho Strogonoff",
        preco: "R$ 48,00",
        simples: "Carne com molho de creme",
      },
      {
        item: "Salada Avassaladora",
        preco: "R$ 39,90",
        simples: "Salada grande com frango",
      },
    ],
  },
  {
    slug: "mcdonalds",
    nome: "Mc Donald's — Quiosque Q3C",
    categoria: "Alimentação",
    piso: "2º Pavimento (Praça de Alimentação)",
    horario: "Todos os dias 10h–22h",
    descricao:
      "Lanchonete na Alameda das Cores, na Praça de Alimentação. Acesso por escada rolante ou elevador.",
    descricaoSimples:
      "Lanchonete no piso de cima, na praça de comida.",
    cardapio: [
      {
        item: "Big Mac",
        preco: "R$ 28,90",
        simples: "Hambúrguer grande com dois hambúrgueres",
      },
      {
        item: "McNuggets 10 un.",
        preco: "R$ 24,50",
        simples: "Frango em pedacinhos frito",
      },
      {
        item: "McFlurry Ovomaltine",
        preco: "R$ 14,90",
        simples: "Sorvete com chocolate crocante",
      },
    ],
  },
  {
    slug: "ca",
    nome: "C&A — Loja 147",
    categoria: "Varejo",
    piso: "1º Pavimento (Térreo)",
    areaM2: 619.17,
    horario: "Seg–sáb 10h–22h · Dom 12h–20h",
    descricao:
      "Loja de roupas e acessórios. Ponto de referência central do 1º Pavimento.",
    descricaoSimples: "Loja de roupas no meio do piso de baixo.",
  },
  {
    slug: "praça-alimentacao",
    nome: "Praça de Alimentação",
    categoria: "Serviços",
    piso: "2º Pavimento",
    horario: "Todos os dias 10h–22h",
    descricao:
      "Área com quiosques e restaurantes na Alameda das Cores, com sanitários acessíveis.",
    descricaoSimples:
      "Lugar de comer no piso de cima, com banheiros.",
  },
];

export function acharLocal(slug: string): Local | undefined {
  return LOCAIS.find((l) => l.slug === slug);
}
