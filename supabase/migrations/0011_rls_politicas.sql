-- Consultas SECURITY DEFINER evitam recursão nas políticas que consultam usuários/lojas.
create or replace function public.usuario_e_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.id = auth.uid()
      and u.papel = 'admin'
      and u.situacao = 'ativa'
  );
$$;

create or replace function public.usuario_e_dono_da_loja(p_loja_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.lojas l
    join public.usuarios u on u.id = l.usuario_id
    where l.id = p_loja_id
      and l.usuario_id = auth.uid()
      and u.situacao = 'ativa'
  );
$$;

revoke all on function public.usuario_e_admin() from public;
revoke all on function public.usuario_e_dono_da_loja(uuid) from public;
grant execute on function public.usuario_e_admin() to anon, authenticated;
grant execute on function public.usuario_e_dono_da_loja(uuid) to anon, authenticated;

create policy usuarios_leitura_propria_ou_admin
  on public.usuarios for select to authenticated
  using (id = (select auth.uid()) or (select public.usuario_e_admin()));

create policy lojas_leitura_publica_ou_propria
  on public.lojas for select to anon, authenticated
  using (
    situacao = 'ativa'
    or usuario_id = (select auth.uid())
    or (select public.usuario_e_admin())
  );

create policy lojas_atualizacao_propria_ou_admin
  on public.lojas for update to authenticated
  using (
    (select public.usuario_e_dono_da_loja(id))
    or (select public.usuario_e_admin())
  )
  with check (
    usuario_id = (select auth.uid())
    or (select public.usuario_e_admin())
  );

create policy categorias_leitura_publica_ou_propria
  on public.categorias for select to anon, authenticated
  using (
    (situacao = 'ativa' and exists (
      select 1 from public.lojas l
      where l.id = loja_id and l.situacao = 'ativa'
    ))
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy categorias_escrita_propria_ou_admin
  on public.categorias for all to authenticated
  using (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  )
  with check (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

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
        and i.situacao = 'disponivel'
        and l.situacao = 'ativa'
    )
  );

create policy temas_escrita_propria_ou_admin
  on public.temas for all to authenticated
  using (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  )
  with check (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy itens_leitura_publica_ou_propria
  on public.itens for select to anon, authenticated
  using (
    (situacao = 'disponivel' and exists (
      select 1 from public.lojas l
      where l.id = loja_id and l.situacao = 'ativa'
    ))
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy itens_escrita_propria_ou_admin
  on public.itens for all to authenticated
  using (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  )
  with check (
    (select public.usuario_e_dono_da_loja(loja_id))
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
        and i.situacao = 'disponivel'
        and l.situacao = 'ativa'
    )
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy item_categorias_escrita_propria_ou_admin
  on public.item_categorias for all to authenticated
  using (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  )
  with check (
    (select public.usuario_e_dono_da_loja(loja_id))
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
        and i.situacao = 'disponivel'
        and l.situacao = 'ativa'
    )
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy fotos_escrita_propria_ou_admin
  on public.fotos for all to authenticated
  using (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  )
  with check (
    (select public.usuario_e_dono_da_loja(loja_id))
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
        and i.situacao = 'disponivel'
        and l.situacao = 'ativa'
    )
    or (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy extras_servico_escrita_propria_ou_admin
  on public.extras_servico for all to authenticated
  using (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  )
  with check (
    (select public.usuario_e_dono_da_loja(loja_id))
    or (select public.usuario_e_admin())
  );

create policy tokens_acesso_leitura_admin
  on public.tokens_acesso for select to authenticated
  using ((select public.usuario_e_admin()));

-- A interface administrativa lê apenas os metadados; o hash permanece indisponível.
revoke all on public.tokens_acesso from anon, authenticated;
grant select (
  id, criado_por, emitido_para, expira_em, usado_em, usado_por, revogado_em, criado_em
) on public.tokens_acesso to authenticated;

create view public.tokens_acesso_admin
with (security_invoker = true)
as
select id, criado_por, emitido_para, expira_em, usado_em, usado_por, revogado_em, criado_em
from public.tokens_acesso;

revoke all on public.tokens_acesso_admin from public, anon;
grant select on public.tokens_acesso_admin to authenticated;