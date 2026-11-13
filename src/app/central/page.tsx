import { equipamentos } from '@/lib/dados';

export const metadata = { title: 'Fila de pedidos' };

// T12: Central da equipe (RF-22, RF-23, RF-25).
// TODO(RF-22): fila em tempo real (porta CanalCentral → Supabase Realtime), alerta sonoro e visual,
// prioridade para saúde e criança perdida, ações aceitar / a caminho / concluir / trote.
// TODO(RF-23): alternar status dos equipamentos (tabela equipamentos) refletindo nas rotas.
export default function PaginaCentral() {
  return (
    <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
      <section aria-labelledby="fila" className="rounded-xl border border-borda p-4">
        <h1 id="fila" className="text-2xl font-bold">
          Fila de pedidos
        </h1>
        <p className="mt-2 text-texto-suave">Em construção: pedidos chegarão aqui em tempo real.</p>
      </section>
      <section aria-labelledby="equipamentos" className="rounded-xl border border-borda p-4">
        <h2 id="equipamentos" className="text-xl font-bold">
          Equipamentos
        </h2>
        <ul className="mt-2 space-y-2">
          {equipamentos.map((e) => (
            <li key={e.id} className="rounded-lg border border-borda p-2">
              <strong>{e.id}</strong> · {e.descricao} · status: {e.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
