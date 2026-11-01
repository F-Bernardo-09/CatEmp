-- 0003_lojas.sql
-- Perfil público e contatos da loja. Cada usuário tem no máximo uma loja.

create table public.lojas (
  id             uuid primary key default gen_random_uuid(),
  -- UNIQUE garante 1 loja por usuário.
  -- Sem "on delete cascade" de propósito: no rollback do cadastro, a loja
  -- deve ser apagada antes do usuário.
  usuario_id     uuid not null unique references public.usuarios (id),
  nome_comercial varchar(120) not null,
  slug           varchar(60)  not null unique,
  descricao      text,
  logo_url       text,
  capa_url       text,
  email          varchar(254),
  telefone       varchar(20),
  whatsapp       varchar(13)  not null,
  bairro         varchar(80),
  cidade         varchar(80),
  estado         char(2),
  situacao       varchar(10)  not null default 'ativa',
  criado_em      timestamptz  not null default now(),
  atualizado_em  timestamptz  not null default now(),

  -- minúsculas, números e hífens simples (ex.: festas-da-edmilsa)
  constraint lojas_slug_formato_check
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- somente dígitos: país + DDD + número (ex.: 5583999999999)
  constraint lojas_whatsapp_formato_check
    check (whatsapp ~ '^[0-9]{12,13}$'),
  constraint lojas_situacao_check
    check (situacao in ('pendente', 'ativa', 'suspensa', 'encerrada'))
);

create trigger lojas_atualizado_em
  before update on public.lojas
  for each row execute function public.definir_atualizado_em();

-- RLS ligado sem políticas até a 0011.
alter table public.lojas enable row level security;