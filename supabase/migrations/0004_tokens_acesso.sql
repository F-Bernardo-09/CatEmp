-- 0004_tokens_acesso.sql
-- Códigos de uso único que liberam a criação de contas de vendedora.
-- Escrita somente pelas Edge Functions (service_role).
-- A situação (disponível, usado, vencido, revogado) é CALCULADA, não é coluna.

create table public.tokens_acesso (
  id           uuid primary key default gen_random_uuid(),
  token_hash   char(64)     not null unique,   -- SHA-256 em hexadecimal; o código real nunca é guardado
  criado_por   uuid         not null references public.usuarios (id),
  emitido_para varchar(120) not null,
  expira_em    timestamptz  not null,
  usado_em     timestamptz,
  usado_por    uuid references public.usuarios (id) on delete set null,
  revogado_em  timestamptz,
  criado_em    timestamptz  not null default now(),

  constraint tokens_hash_formato_check
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint tokens_expira_depois_de_criar_check
    check (expira_em > criado_em),
  -- token já usado não pode ser revogado, e vice-versa
  constraint tokens_usado_ou_revogado_check
    check (not (usado_em is not null and revogado_em is not null))
);

-- Índices nas FKs para acelerar joins e exclusões.
create index tokens_acesso_criado_por_idx on public.tokens_acesso (criado_por);
create index tokens_acesso_usado_por_idx  on public.tokens_acesso (usado_por);

-- RLS ligado sem políticas até a 0011.
alter table public.tokens_acesso enable row level security;