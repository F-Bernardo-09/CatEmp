-- Itens de catálogo pertencentes a uma loja.

create table public.itens (
  id                uuid primary key default gen_random_uuid(),
  codigo_publico    varchar(8) not null unique,
  loja_id           uuid not null references public.lojas (id),
  tipo              varchar(10) not null,
  modalidade        varchar(7) not null,
  titulo            varchar(120) not null,
  descricao         text not null,
  altura            numeric(8, 2) not null,
  largura           numeric(8, 2) not null,
  profundidade      numeric(8, 2) not null,
  preco_base        numeric(10, 2) not null,
  preco_reposicao   numeric(10, 2) not null,
  situacao          varchar(15) not null default 'oculto',
  em_destaque       boolean not null default false,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now(),

  constraint itens_tipo_check check (tipo in ('produto', 'servico')),
  constraint itens_modalidade_check check (modalidade in ('aluguel', 'venda')),
  constraint itens_situacao_check
    check (situacao in ('disponivel', 'manutencao', 'oculto')),
  constraint itens_altura_check check (altura > 0),
  constraint itens_largura_check check (largura > 0),
  constraint itens_profundidade_check check (profundidade > 0),
  constraint itens_preco_base_check check (preco_base >= 0),
  constraint itens_preco_reposicao_check check (preco_reposicao >= 0),
  constraint itens_id_loja_unique unique (id, loja_id),
  constraint itens_id_loja_modalidade_unique unique (id, loja_id, modalidade)
);

create index itens_loja_id_idx on public.itens (loja_id);
create index itens_loja_situacao_idx on public.itens (loja_id, situacao);

create trigger itens_codigo_publico
  before insert on public.itens
  for each row execute function public.preencher_codigo_publico();

create trigger itens_atualizado_em
  before update on public.itens
  for each row execute function public.definir_atualizado_em();

alter table public.itens enable row level security;