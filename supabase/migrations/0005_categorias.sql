-- 0005_categorias.sql
-- Categorias criadas e reutilizadas por cada loja.

create table public.categorias (
  id       uuid primary key default gen_random_uuid(),
  loja_id  uuid not null references public.lojas (id),
  nome     varchar(60) not null,
  slug     varchar(60) not null,
  situacao varchar(10) not null default 'ativa',

  constraint categorias_situacao_check check (situacao in ('ativa', 'inativa')),
  constraint categorias_slug_formato_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- o slug só precisa ser único dentro da mesma loja
  constraint categorias_loja_slug_unique unique (loja_id, slug),
  -- necessário para a FK composta de item_categorias (categoria_id, loja_id),
  -- que impede ligar um item a categoria de outra loja
  constraint categorias_id_loja_unique unique (id, loja_id)
);

-- RLS ligado sem políticas até a 0011.
alter table public.categorias enable row level security;