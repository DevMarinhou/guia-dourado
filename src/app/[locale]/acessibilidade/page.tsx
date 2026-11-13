import { setRequestLocale } from 'next-intl/server';

export const metadata = { title: 'Declaração de acessibilidade' };

// RF-30. TODO(i18n): versões em inglês e espanhol; atualizar a data a cada avaliação.
export default async function Acessibilidade({ params }: PageProps<'/[locale]/acessibilidade'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <article className="space-y-4">
      <h1 className="text-2xl font-bold">Declaração de acessibilidade</h1>
      <p>
        O Guia Dourado busca atender à <strong>WCAG 2.2 nível AA</strong>, alinhada à <strong>ABNT NBR 17225:2025</strong>,
        com critérios AAA selecionados (contraste 7:1 no tema de alto contraste, alvos de toque de 48 px e linguagem simples).
      </p>
      <h2 className="text-xl font-bold">Recursos</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Leitura em voz alta, Libras (VLibras) e três idiomas (português, inglês e espanhol).</li>
        <li>Alto contraste, tema escuro, fonte ampliada até 200% e movimento reduzido.</li>
        <li>Mapa com alternativa em lista e rotas sem degraus.</li>
        <li>Ajuda humana sempre disponível no mesmo lugar.</li>
      </ul>
      <h2 className="text-xl font-bold">Limitações conhecidas</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Versão em desenvolvimento (MVP do hackathon): algumas telas ainda estão em construção.</li>
        <li>O VLibras depende de internet e do serviço do governo federal.</li>
      </ul>
      <h2 className="text-xl font-bold">Encontrou uma barreira?</h2>
      <p>Use a tela Avaliar ou fale com o SAC do shopping.</p>
      <p className="text-sm text-texto-suave">Última avaliação: 13/11/2026 (planejamento).</p>
    </article>
  );
}
