begin;

select plan(8);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
)
values
  (
    '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated',
    'rls-a@example.test', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated',
    'rls-b@example.test', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb
  );

insert into public.usuarios (id, nome, papel)
values
  ('11111111-1111-4111-8111-111111111111', 'Teste A', 'vendedor'),
  ('22222222-2222-4222-8222-222222222222', 'Teste B', 'vendedor');

insert into public.lojas (id, usuario_id, nome_comercial, slug, whatsapp)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Loja A', 'loja-a-rls', '5583999999991'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Loja B', 'loja-b-rls', '5583999999992'
  );

insert into public.itens (
  id, loja_id, tipo, modalidade, titulo, descricao,
  altura, largura, profundidade, preco_base, preco_reposicao, situacao
)
values
  (
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'produto', 'aluguel', 'Item privado A', '', 1, 1, 1, 10, 10, 'oculto'
  ),
  (
    'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'produto', 'aluguel', 'Item privado B', '', 1, 1, 1, 10, 10, 'oculto'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select is(
  (select count(*)::integer from public.itens
   where id = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'),
  1,
  'Usuário A pode consultar o item privado da própria loja'
);
select throws_ok(
  $$update public.itens set situacao = 'disponivel'
    where id = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'$$,
  '23514',
  'O item precisa de uma foto principal para ser publicado.',
  'Item sem foto principal não pode ser publicado'
);

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select is(
  (select count(*)::integer from public.itens
   where id = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'),
  0,
  'Usuário B não pode consultar o item privado da loja A'
);
select is(
  (with alteracao as (
    update public.itens set titulo = 'Acesso indevido'
    where id = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'
    returning 1
  )
  select count(*)::integer from alteracao),
  0,
  'Usuário B não pode alterar o item da loja A'
);
select is(
  (select count(*)::integer from public.itens
   where id = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'),
  1,
  'Usuário B pode consultar o item privado da própria loja'
);

reset role;
insert into public.fotos (
  item_id, loja_id, caminho_storage, texto_alternativo, posicao, principal
)
values (
  'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa/teste.webp',
  'Foto principal de teste',
  0,
  true
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select throws_ok(
  $$update public.itens
    set titulo = '   ', situacao = 'disponivel'
    where id = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'$$,
  '23514',
  'O item precisa de um título para ser publicado.',
  'Item sem título não pode ser publicado'
);
select throws_ok(
  $$update public.itens
    set preco_base = 0, situacao = 'disponivel'
    where id = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'$$,
  '23514',
  'O item precisa de um preço maior que zero para ser publicado.',
  'Item sem preço positivo não pode ser publicado'
);
select is(
  (with publicacao as (
    update public.itens set situacao = 'disponivel'
    where id = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'
    returning 1
  )
  select count(*)::integer from publicacao),
  1,
  'Item com título, preço e foto principal pode ser publicado'
);
reset role;
select * from finish();
rollback;
