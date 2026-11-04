create or replace function public.validar_publicacao_item()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.situacao = 'disponivel' then
    if btrim(new.titulo) = '' then
      raise exception 'O item precisa de um título para ser publicado.'
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

create trigger itens_validar_publicacao
  before insert or update on public.itens
  for each row execute function public.validar_publicacao_item();

create or replace function public.validar_item_de_servico_extra()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (
    select 1
    from public.itens i
    where i.id = new.item_id
      and i.loja_id = new.loja_id
      and i.tipo = 'servico'
  ) then
    raise exception 'Adicionais só podem ser vinculados a itens do tipo serviço.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger extras_servico_validar_tipo_item
  before insert or update on public.extras_servico
  for each row execute function public.validar_item_de_servico_extra();
