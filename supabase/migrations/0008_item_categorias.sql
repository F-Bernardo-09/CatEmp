-- Relação entre itens e categorias da mesma loja e modalidade.

alter table public.categorias
  add column modalidade varchar(7) not null,
  add constraint categorias_modalidade_check
    check (modalidade in ('aluguel', 'venda')),
  add constraint categorias_loja_modalidade_slug_unique
    unique (loja_id, modalidade, slug),
  add constraint categorias_id_loja_modalidade_unique
    unique (id, loja_id, modalidade);

create table public.item_categorias (
  item_id     uuid not null,
  loja_id     uuid not null,
  modalidade  varchar(7) not null,
  categoria_id uuid not null,

  primary key (item_id, categoria_id),
  constraint item_categorias_item_fk
    foreign key (item_id, loja_id, modalidade)
    references public.itens (id, loja_id, modalidade) on delete cascade,
  constraint item_categorias_categoria_fk
    foreign key (categoria_id, loja_id, modalidade)
    references public.categorias (id, loja_id, modalidade) on delete restrict
);

create index item_categorias_categoria_id_idx
  on public.item_categorias (categoria_id);

alter table public.item_categorias enable row level security;