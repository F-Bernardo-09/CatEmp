begin;

select plan(17);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
)
values (
  '33333333-3333-4333-8333-333333333333',
  'authenticated',
  'authenticated',
  'catalogo-fluxo@example.test',
  '',
  now(),
  now(),
  now(),
  '{}'::jsonb,
  '{}'::jsonb
);

insert into public.usuarios (id, nome, papel)
values (
  '33333333-3333-4333-8333-333333333333',
  'Teste de catálogo',
  'vendedor'
);

insert into public.lojas (id, usuario_id, nome_comercial, slug, whatsapp)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  '33333333-3333-4333-8333-333333333333',
  'Loja de teste',
  'loja-catalogo-fluxo',
  '5583999999993'
);

insert into public.categorias (loja_id, modalidade, nome, slug)
values
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'aluguel',
    'Cortinas',
    'cortinas'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'venda',
    'Cortinas',
    'cortinas'
  );

insert into public.temas (loja_id, nome)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Floral');

insert into public.itens (
  id, loja_id, tipo, modalidade, titulo, descricao,
  altura, largura, profundidade, preco_base, preco_reposicao
)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'servico',
  'aluguel',
  'Cortina floral',
  'Cortina para decoração de eventos.',
  2,
  1.5,
  0.1,
  80,
  250
);

select ok(
  length((select codigo_publico from public.itens
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd')) > 0,
  'O item recebe código público automaticamente'
);

select is(
  (select situacao from public.itens
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
  'oculto',
  'O item começa oculto até ser publicado'
);

select is(
  (
    select count(*)::integer
    from public.categorias
    where loja_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
      and slug = 'cortinas'
  ),
  2,
  'A mesma categoria pode existir nas modalidades aluguel e venda'
);

insert into public.item_categorias (
  item_id, loja_id, modalidade, categoria_id
)
select
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'aluguel',
  id
from public.categorias
where loja_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
  and modalidade = 'aluguel'
  and nome = 'Cortinas';

select is(
  (
    select count(*)::integer
    from public.item_categorias
    where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  ),
  1,
  'O item pode ser associado a uma categoria da mesma modalidade'
);

insert into public.fotos (
  item_id, loja_id, tema_id, caminho_storage,
  texto_alternativo, posicao, principal
)
select
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  t.id,
  dados.caminho,
  dados.alt,
  dados.posicao,
  dados.principal
from public.temas t
cross join (
  values
    (
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc/dddddddd-dddd-4ddd-8ddd-dddddddddddd/1.webp',
      'Cortina floral vista de frente',
      0,
      true
    ),
    (
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc/dddddddd-dddd-4ddd-8ddd-dddddddddddd/2.webp',
      'Detalhe do tecido da cortina',
      1,
      false
    )
) as dados(caminho, alt, posicao, principal)
where t.loja_id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
  and t.nome = 'Floral';

select is(
  (
    select count(*)::integer
    from public.fotos
    where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  ),
  2,
  'O item aceita várias fotos ordenadas'
);

select is(
  (
    select texto_alternativo
    from public.fotos
    where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
      and posicao = 1
  ),
  'Detalhe do tecido da cortina',
  'Cada foto preserva seu texto alternativo'
);

select is(
  (
    select count(*)::integer
    from public.fotos f
    join public.temas t on t.id = f.tema_id
    where f.item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
      and t.nome = 'Floral'
  ),
  2,
  'As fotos podem ser associadas a um tema da loja'
);

update public.itens
set titulo = 'Cortina floral atualizada',
    altura = 2.2,
    preco_base = 95,
    preco_reposicao = 300
where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

select is(
  (
    select jsonb_build_object(
      'titulo', titulo,
      'altura', altura,
      'preco_base', preco_base,
      'preco_reposicao', preco_reposicao
    )
    from public.itens
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  ),
  jsonb_build_object(
    'titulo', 'Cortina floral atualizada',
    'altura', 2.2,
    'preco_base', 95,
    'preco_reposicao', 300
  ),
  'Os dados principais e os valores do item podem ser atualizados'
);

update public.fotos
set principal = false
where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  and principal;

update public.fotos
set principal = true
where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  and posicao = 1;

select is(
  (
    select caminho_storage
    from public.fotos
    where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
      and principal
  ),
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc/dddddddd-dddd-4ddd-8ddd-dddddddddddd/2.webp',
  'A foto principal pode ser trocada'
);

delete from public.item_categorias
where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

select is(
  (
    select count(*)::integer
    from public.item_categorias
    where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  ),
  0,
  'O item pode ficar sem categorias'
);

insert into public.extras_servico (
  item_id, loja_id, nome, preco_minimo, caminho_storage
)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'Montagem especial',
  35,
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc/dddddddd-dddd-4ddd-8ddd-dddddddddddd/extras/montagem.webp'
);

select is(
  (
    select count(*)::integer
    from public.extras_servico
    where item_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
      and nome = 'Montagem especial'
  ),
  1,
  'Um adicional com preço e foto pode ser associado a um serviço'
);

insert into public.itens (
  id, loja_id, tipo, modalidade, titulo, descricao,
  altura, largura, profundidade, preco_base, preco_reposicao
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'produto',
  'venda',
  'Colcha',
  'Colcha para cama.',
  2,
  2,
  0.1,
  150,
  150
);

select throws_ok(
  $$insert into public.extras_servico (
      item_id, loja_id, nome, preco_minimo, caminho_storage
    )
    values (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      'Adicional inválido',
      10,
      'cccccccc-cccc-4ccc-8ccc-cccccccccccc/colcha.webp'
    )$$,
  '23514',
  'Adicionais só podem ser vinculados a itens do tipo serviço.',
  'Um adicional não pode ser associado a um produto'
);

select throws_ok(
  $$update public.itens
    set titulo = '   ', situacao = 'disponivel'
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'$$,
  '23514',
  'O item precisa de um título para ser publicado.',
  'Uma falha de validação impede a publicação'
);

select is(
  (
    select titulo
    from public.itens
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  ),
  'Cortina floral atualizada',
  'Uma operação que falha não deixa os dados parcialmente alterados'
);

update public.itens
set titulo = 'Cortina floral atualizada',
    situacao = 'disponivel'
where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

select is(
  (
    select count(*)::integer
    from public.itens
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  ),
  1,
  'Tentar salvar novamente o mesmo item não cria uma duplicata'
);

select is(
  (
    select situacao
    from public.itens
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
  ),
  'disponivel',
  'O item é publicado após a correção da falha'
);

select is(
  (select count(*)::integer from storage.buckets where id = 'fotos'),
  1,
  'O bucket de fotos existe no ambiente integrado'
);

select * from finish();
rollback;
