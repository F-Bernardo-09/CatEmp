alter table public.itens disable trigger itens_validar_publicacao;

update public.itens
set descricao = concat_ws(
  E'\n\n',
  nullif(btrim(descricao), ''),
  'Medidas registradas anteriormente (cm): '
    || altura::text || ' × ' || largura::text || ' × ' || profundidade::text
)
where altura is not null
  and largura is not null
  and profundidade is not null;

drop policy if exists temas_leitura_publica_ou_propria on public.temas;
drop policy if exists itens_leitura_publica_ou_propria on public.itens;
drop policy if exists item_categorias_leitura_publica_ou_propria
  on public.item_categorias;
drop policy if exists fotos_leitura_publica_ou_propria on public.fotos;
drop policy if exists extras_servico_leitura_publica_ou_propria
  on public.extras_servico;

alter table public.itens
  drop constraint itens_situacao_check,
  drop constraint itens_altura_check,
  drop constraint itens_largura_check,
  drop constraint itens_profundidade_check;

update public.itens
set situacao = case situacao
  when 'disponivel' then 'publicado'
  when 'manutencao' then 'arquivado'
  when 'oculto' then 'rascunho'
end;

alter table public.itens
  alter column situacao type varchar(10),
  alter column situacao set default 'rascunho',
  add constraint itens_situacao_check
    check (situacao in ('rascunho', 'publicado', 'arquivado')),
  add constraint itens_descricao_nao_vazia_check
    check (descricao ~ '[^[:space:]]'),
  drop column altura,
  drop column largura,
  drop column profundidade;

create or replace function public.validar_publicacao_item()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.situacao = 'publicado' then
    if btrim(new.titulo) = '' then
      raise exception 'O item precisa de um título para ser publicado.'
        using errcode = '23514';
    end if;

    if new.descricao !~ '[^[:space:]]' then
      raise exception 'O item precisa de uma descrição para ser publicado.'
        using errcode = '23514';
    end if;

    if new.preco_base <= 0 then
      raise exception 'O item precisa de um preço maior que zero para ser publicado.'
        using errcode = '23514';
    end if;

    if not exists (
      select 1
      from public.fotos f
      where f.item_id = new.id
        and f.loja_id = new.loja_id
        and f.principal
    ) then
      raise exception 'O item precisa de uma foto principal para ser publicado.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

alter table public.itens enable trigger itens_validar_publicacao;

create policy temas_leitura_publica_ou_propria
  on public.temas for select to anon, authenticated
  using (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
    or exists (
      select 1
      from public.fotos f
      join public.itens i on i.id = f.item_id and i.loja_id = f.loja_id
      join public.lojas l on l.id = i.loja_id
      where f.tema_id = temas.id
        and i.situacao = 'publicado'
        and l.situacao = 'ativa'
    )
  );

create policy itens_leitura_publica_ou_propria
  on public.itens for select to anon, authenticated
  using (
    (situacao = 'publicado' and exists (
      select 1 from public.lojas l
      where l.id = loja_id and l.situacao = 'ativa'
    ))
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy item_categorias_leitura_publica_ou_propria
  on public.item_categorias for select to anon, authenticated
  using (
    exists (
      select 1 from public.itens i
      join public.lojas l on l.id = i.loja_id
      where i.id = item_id
        and i.loja_id = item_categorias.loja_id
        and i.situacao = 'publicado'
        and l.situacao = 'ativa'
    )
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy fotos_leitura_publica_ou_propria
  on public.fotos for select to anon, authenticated
  using (
    exists (
      select 1 from public.itens i
      join public.lojas l on l.id = i.loja_id
      where i.id = item_id
        and i.loja_id = fotos.loja_id
        and i.situacao = 'publicado'
        and l.situacao = 'ativa'
    )
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy extras_servico_leitura_publica_ou_propria
  on public.extras_servico for select to anon, authenticated
  using (
    exists (
      select 1 from public.itens i
      join public.lojas l on l.id = i.loja_id
      where i.id = item_id
        and i.loja_id = extras_servico.loja_id
        and i.situacao = 'publicado'
        and l.situacao = 'ativa'
    )
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );
