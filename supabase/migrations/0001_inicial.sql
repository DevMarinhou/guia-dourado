-- Guia Dourado · migração inicial (docs/10-dados-e-rotas.md §10.8, ADR-0008)
-- Aplicar no SQL Editor do Supabase (projeto na região de São Paulo) ou com `supabase db push`.
-- Princípios: o visitante NUNCA acessa o banco diretamente (só via Route Handlers com a chave de
-- serviço no servidor); a equipe acessa autenticada e com RLS; dados mínimos (LGPD).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tipos
create type tipo_ajuda   as enum ('orientacao','acompanhamento','comunicacao','saude','crianca_perdida','seguranca');
create type modo_comunic as enum ('texto','libras','voz','idioma','pictogramas');
create type status_ajuda as enum ('aberto','aceito','a_caminho','concluido','cancelado','trote');

-- ---------------------------------------------------------------- equipe (perfis)
create table equipe (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  papel      text not null check (papel in ('atendente','supervisor','manutencao','admin')),
  criado_em  timestamptz not null default now()
);

create or replace function eh_equipe() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from equipe where usuario_id = auth.uid());
$$;

-- ---------------------------------------------------------------- pedidos de ajuda (RF-19 a RF-22)
create table pedidos_ajuda (
  id                uuid primary key default gen_random_uuid(),
  criado_em         timestamptz not null default now(),
  tipo              tipo_ajuda not null,
  prioridade        smallint generated always as (case when tipo in ('saude','crianca_perdida') then 1 else 2 end) stored,
  ponto_codigo      text not null,
  piso_id           text not null,
  modo_comunicacao  modo_comunic not null,
  idioma            text not null check (idioma in ('pt-BR','en','es')),
  observacao        text check (char_length(observacao) <= 280),
  status            status_ajuda not null default 'aberto',
  atendente_id      uuid references auth.users(id),
  previsao_min      int check (previsao_min between 0 and 120),
  token_hash        text not null,              -- hash do token de acompanhamento (visitante)
  aparelho_hash     text not null,              -- hash do UUID do aparelho (limite de envios, RN-03)
  consentimento_em  timestamptz not null,       -- LGPD art. 11, I
  atualizado_em     timestamptz not null default now()
);
create index on pedidos_ajuda (status, prioridade, criado_em);
create index on pedidos_ajuda (aparelho_hash, criado_em);

create table eventos_pedido (
  id         bigserial primary key,
  pedido_id  uuid not null references pedidos_ajuda(id) on delete cascade,
  criado_em  timestamptz not null default now(),
  status     status_ajuda not null,
  autor      text not null check (autor in ('visitante','equipe','sistema'))
);

-- ---------------------------------------------------------------- equipamentos (RF-23)
create table equipamentos (
  id              text primary key,             -- ELV-01, ROL-01…
  tipo            text not null check (tipo in ('elevador','escada_rolante')),
  descricao       text not null,
  status          text not null default 'operando' check (status in ('operando','manutencao','fora')),
  atualizado_em   timestamptz not null default now(),
  atualizado_por  uuid references auth.users(id)
);
insert into equipamentos (id, tipo, descricao) values
  ('ELV-01', 'elevador', 'Elevador principal (posição a validar)'),
  ('ELV-02', 'elevador', 'Elevador secundário (posição a validar)'),
  ('ROL-01', 'escada_rolante', 'Escadas rolantes da praça de alimentação');

-- ---------------------------------------------------------------- barreiras e avaliações (RF-24, RF-25)
create table barreiras (
  id            uuid primary key default gen_random_uuid(),
  criado_em     timestamptz not null default now(),
  tipo          text not null check (tipo in ('elevador_parado','escada_sem_alternativa','caminho_bloqueado','sinalizacao','app','outro')),
  ponto_codigo  text,
  descricao     text check (char_length(descricao) <= 500),
  status        text not null default 'nova' check (status in ('nova','em_analise','resolvida','descartada')),
  resolvido_em  timestamptz
);

create table avaliacoes (
  id          bigserial primary key,
  criado_em   timestamptz not null default now(),
  chegou      text not null check (chegou in ('sim','com_dificuldade','nao')),
  nota        smallint check (nota between 1 and 5),
  perfil_rota text   -- opcional e só com consentimento; sem identificar a pessoa
);

-- ---------------------------------------------------------------- métricas agregadas (RNF-13)
create table leituras_ponto_diarias (
  codigo text not null,
  dia    date not null default current_date,
  total  int  not null default 0,
  primary key (codigo, dia)
);

create or replace function registrar_leitura(p_codigo text) returns void
language sql security definer set search_path = public as $$
  insert into leituras_ponto_diarias (codigo, dia, total) values (upper(p_codigo), current_date, 1)
  on conflict (codigo, dia) do update set total = leituras_ponto_diarias.total + 1;
$$;

-- ---------------------------------------------------------------- LGPD: anonimização em 30 dias (RN-05)
create or replace function anonimizar_pedidos_antigos() returns void
language sql security definer set search_path = public as $$
  update pedidos_ajuda
     set observacao = null, token_hash = 'anonimizado', aparelho_hash = 'anonimizado'
   where criado_em < now() - interval '30 days' and aparelho_hash <> 'anonimizado';
$$;
-- Agendar (extensão pg_cron no Supabase):
-- select cron.schedule('anonimizar-pedidos', '0 4 * * *', 'select anonimizar_pedidos_antigos()');

-- ---------------------------------------------------------------- RLS
alter table equipe                 enable row level security;
alter table pedidos_ajuda          enable row level security;
alter table eventos_pedido         enable row level security;
alter table equipamentos           enable row level security;
alter table barreiras              enable row level security;
alter table avaliacoes             enable row level security;
alter table leituras_ponto_diarias enable row level security;

-- Sem políticas para "anon": o visitante não lê nem escreve direto (só via servidor com a chave de serviço).
create policy equipe_le_equipe       on equipe                 for select to authenticated using (eh_equipe());
create policy equipe_le_pedidos      on pedidos_ajuda          for select to authenticated using (eh_equipe());
create policy equipe_atualiza_pedido on pedidos_ajuda          for update to authenticated using (eh_equipe()) with check (eh_equipe());
create policy equipe_le_eventos      on eventos_pedido         for select to authenticated using (eh_equipe());
create policy equipe_cria_eventos    on eventos_pedido         for insert to authenticated with check (eh_equipe());
create policy equipe_le_equip        on equipamentos           for select to authenticated using (eh_equipe());
create policy equipe_atualiza_equip  on equipamentos           for update to authenticated using (eh_equipe()) with check (eh_equipe());
create policy equipe_le_barreiras    on barreiras              for select to authenticated using (eh_equipe());
create policy equipe_trata_barreiras on barreiras              for update to authenticated using (eh_equipe()) with check (eh_equipe());
create policy equipe_le_avaliacoes   on avaliacoes             for select to authenticated using (eh_equipe());
create policy equipe_le_leituras     on leituras_ponto_diarias for select to authenticated using (eh_equipe());

-- ---------------------------------------------------------------- tempo real para a Central (RF-22)
alter publication supabase_realtime add table pedidos_ajuda, equipamentos;
