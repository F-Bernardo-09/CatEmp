-- 0002_usuarios.sql
-- Perfil do usuário, ligado ao Supabase Auth. E-mail e senha ficam em auth.users.

create table public.usuarios (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          varchar(120) not null,
  papel         varchar(10)  not null default 'vendedor',
  situacao      varchar(10)  not null default 'ativa',
  criado_em     timestamptz  not null default now(),
  atualizado_em timestamptz  not null default now(),

  constraint usuarios_papel_check    check (papel in ('admin', 'vendedor')),
  constraint usuarios_situacao_check check (situacao in ('ativa', 'suspensa'))
);

create trigger usuarios_atualizado_em
  before update on public.usuarios
  for each row execute function public.definir_atualizado_em();

-- RLS ligado sem políticas: ninguém acessa pelo navegador até a 0011_rls_politicas.sql.
alter table public.usuarios enable row level security;