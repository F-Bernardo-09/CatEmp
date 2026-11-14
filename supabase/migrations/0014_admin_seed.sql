-- 0014_admin_seed.sql
-- Primeiro administrador do sistema.
-- Ajustar o e-mail abaixo no ambiente em que a seed for aplicada.
-- Não versionar e-mail pessoal real em repositório compartilhado.

insert into public.usuarios (id, nome, papel, situacao)
select
  au.id,
  coalesce(au.raw_user_meta_data ->> 'nome', 'Administrador'),
  'admin',
  'ativa'
from auth.users au
where au.email = 'admin@catemp.local'
on conflict (id) do update
set nome = excluded.nome,
    papel = 'admin',
    situacao = 'ativa';
