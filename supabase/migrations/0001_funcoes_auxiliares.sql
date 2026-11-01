-- 0001_funcoes_auxiliares.sql
-- Funções compartilhadas por várias tabelas (triggers e geração de código público).

-- Trigger de UPDATE: mantém atualizado_em sempre em dia.
create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- Gera um código curto aleatório para URLs públicas (itens, temas, extras_servico).
-- Alfabeto de 31 caracteres: maiúsculas e dígitos sem 0, O, 1, I, L (evita confusão visual).
-- Com 5 caracteres: 31^5 ≈ 28,6 milhões de combinações.
create or replace function public.gerar_codigo_publico(tamanho int default 5)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  codigo text := '';
  i int;
begin
  for i in 1..tamanho loop
    codigo := codigo || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
  end loop;
  return codigo;
end;
$$;

-- Trigger BEFORE INSERT: preenche codigo_publico quando vier nulo.
-- Em caso de colisão, sorteia outro (até 20 tentativas).
-- Usa SQL dinâmico para funcionar em qualquer tabela onde for ligado.
create or replace function public.preencher_codigo_publico()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  tentativas int := 0;
  ja_existe boolean;
begin
  if new.codigo_publico is not null then
    return new;
  end if;

  loop
    new.codigo_publico := public.gerar_codigo_publico(5);

    execute format(
      'select exists (select 1 from %I.%I where codigo_publico = $1)',
      tg_table_schema, tg_table_name
    ) into ja_existe using new.codigo_publico;

    exit when not ja_existe;

    tentativas := tentativas + 1;
    if tentativas >= 20 then
      raise exception 'Não foi possível gerar um código público único';
    end if;
  end loop;

  return new;
end;
$$;