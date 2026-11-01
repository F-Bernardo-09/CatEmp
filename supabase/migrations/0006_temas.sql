-- 0006_temas.sql
-- Variações visuais reutilizáveis por loja (ex.: Rústico, Floral, Vaquejada).
-- Depende da 0001 (preencher_codigo_publico).

create table public.temas (
  id             uuid primary key default gen_random_uuid(),
  codigo_publico varchar(8) not null unique,
  loja_id        uuid not null references public.lojas (id),
  nome           varchar(60) not null,
  criado_em      timestamptz not null default now(),

  constraint temas_loja_nome_unique unique (loja_id, nome),
  -- necessário para a FK composta de fotos (tema_id, loja_id)
  constraint temas_id_loja_unique unique (id, loja_id)
);

-- Gera o codigo_publico automaticamente no INSERT.
create trigger temas_codigo_publico
  before insert on public.temas
  for each row execute function public.preencher_codigo_publico();

-- "Tema com fotos não pode ser excluído" é garantido pela FK de fotos (0009)
-- com ON DELETE RESTRICT.

-- RLS ligado sem políticas até a 0011.
alter table public.temas enable row level security;