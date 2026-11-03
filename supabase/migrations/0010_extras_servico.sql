-- Adicionais oferecidos junto a um serviço.

create table public.extras_servico (
  id                   uuid primary key default gen_random_uuid(),
  codigo_publico       varchar(8) not null unique,
  item_id              uuid not null,
  loja_id              uuid not null,
  nome                 varchar(120) not null,
  preco_minimo         numeric(10, 2) not null,
  caminho_storage      text not null,
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),

  constraint extras_servico_preco_check check (preco_minimo >= 0),
  constraint extras_servico_item_fk
    foreign key (item_id, loja_id)
    references public.itens (id, loja_id) on delete cascade
);

create index extras_servico_item_id_idx on public.extras_servico (item_id);

create trigger extras_servico_codigo_publico
  before insert on public.extras_servico
  for each row execute function public.preencher_codigo_publico();

create trigger extras_servico_atualizado_em
  before update on public.extras_servico
  for each row execute function public.definir_atualizado_em();

alter table public.extras_servico enable row level security;