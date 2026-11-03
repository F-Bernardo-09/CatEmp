-- Fotos dos itens, armazenadas no bucket público "fotos".

create table public.fotos (
  id                  uuid primary key default gen_random_uuid(),
  item_id             uuid not null,
  loja_id             uuid not null,
  tema_id             uuid,
  caminho_storage     text not null unique,
  texto_alternativo   varchar(255) not null,
  posicao             integer not null,
  principal           boolean not null default false,
  criado_em           timestamptz not null default now(),

  constraint fotos_posicao_check check (posicao >= 0),
  constraint fotos_item_posicao_unique unique (item_id, posicao),
  constraint fotos_item_fk
    foreign key (item_id, loja_id)
    references public.itens (id, loja_id) on delete cascade,
  constraint fotos_tema_fk
    foreign key (tema_id, loja_id)
    references public.temas (id, loja_id) on delete restrict
);

create unique index fotos_item_principal_unique
  on public.fotos (item_id)
  where principal;

create index fotos_loja_id_idx on public.fotos (loja_id);
create index fotos_tema_id_idx on public.fotos (tema_id);

alter table public.fotos enable row level security;