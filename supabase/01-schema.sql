-- Execute uma vez no SQL Editor do seu projeto Supabase.
-- Não cria usuários, não atribui administradores e não insere dados fictícios.
begin;

create function public.portal_valid_state(s jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare x jsonb; field text; n numeric;
begin
 if jsonb_typeof(s) is distinct from 'object' or s->>'version' is distinct from '1' then return false; end if;
 foreach field in array array['project','client','summary','action','owner','due'] loop
  if jsonb_typeof(s->field) is distinct from 'string' then return false; end if;
 end loop;
 if length(s->>'project')>500 or length(s->>'client')>500 then return false; end if;
 foreach field in array array['stages','updates','documents'] loop
  if jsonb_typeof(s->field) is distinct from 'array' then return false; end if;
 end loop;
 for x in select value from jsonb_array_elements(s->'stages') loop
  foreach field in array array['id','title','description','status'] loop
   if jsonb_typeof(x->field) is distinct from 'string' then return false; end if;
  end loop;
  if jsonb_typeof(x->'progress') is distinct from 'number' then return false; end if;
  n:=(x->>'progress')::numeric;
  if n<0 or n>100 or x->>'status' not in ('pending','active','waiting','done') then return false; end if;
  if (x->>'status'='done' and n<>100) or (x->>'status'='pending' and n<>0) or (x->>'status' in ('active','waiting') and n>=100) then return false; end if;
 end loop;
 for x in select value from jsonb_array_elements(s->'updates') loop
  foreach field in array array['id','title','body','author'] loop
   if jsonb_typeof(x->field) is distinct from 'string' then return false; end if;
  end loop;
  if not (x ? 'date') then return false; end if;
  if x->'date'<>'null'::jsonb then
   if jsonb_typeof(x->'date') is distinct from 'string' then return false; end if;
   perform (x->>'date')::timestamptz;
  end if;
 end loop;
 for x in select value from jsonb_array_elements(s->'documents') loop
  foreach field in array array['id','title','url'] loop
   if jsonb_typeof(x->field) is distinct from 'string' then return false; end if;
  end loop;
  if x->>'url' !~* '^https?://[^[:space:]]+$' then return false; end if;
 end loop;
 return true;
exception when others then return false;
end;
$$;
revoke all on function public.portal_valid_state(jsonb) from public, anon, authenticated;
grant execute on function public.portal_valid_state(jsonb) to authenticated;

-- Estado agrupado em JSON para manter compatibilidade com o MVP e gravar tudo
-- em uma única transação. Não é necessário expor tabelas internas de cada etapa.
create table public.portal_projects (
 id uuid primary key default gen_random_uuid(),
 state jsonb not null check (public.portal_valid_state(state)),
 revision integer not null default 0 check (revision>=0),
 created_at timestamptz not null default now()
);
create table public.portal_members (
 project_id uuid not null references public.portal_projects(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','client')),
 primary key(project_id,user_id)
);
create index portal_members_user_idx on public.portal_members(user_id);
alter table public.portal_projects enable row level security;
alter table public.portal_members enable row level security;

revoke all on table public.portal_projects,public.portal_members from anon,authenticated;
grant select on table public.portal_projects,public.portal_members to authenticated;
grant update(state,revision) on public.portal_projects to authenticated;

create policy members_read_self on public.portal_members
 for select to authenticated using (user_id=(select auth.uid()));
-- Sem políticas de escrita em membros: ninguém consegue se promover pelo app.
-- Vinculações são feitas pelo proprietário no SQL Editor.
create policy projects_read_member on public.portal_projects
 for select to authenticated using (exists (
  select 1 from public.portal_members m
  where m.project_id=portal_projects.id and m.user_id=(select auth.uid())
 ));
create policy projects_update_admin on public.portal_projects
 for update to authenticated using (exists (
  select 1 from public.portal_members m where m.project_id=portal_projects.id
  and m.user_id=(select auth.uid()) and m.role='admin'
 )) with check (exists (
  select 1 from public.portal_members m where m.project_id=portal_projects.id
  and m.user_id=(select auth.uid()) and m.role='admin'
 ));

create function public.portal_save_project(p_id uuid,p_revision integer,p_state jsonb)
returns setof public.portal_projects
language plpgsql security invoker set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Login obrigatório' using errcode='42501'; end if;
 if not public.portal_valid_state(p_state) then raise exception 'Estado inválido' using errcode='22023'; end if;
 return query update public.portal_projects
 set state=p_state,revision=revision+1
 where id=p_id and revision=p_revision returning *;
 if not found then
  raise exception 'Sem acesso ou versão desatualizada' using errcode='40001';
 end if;
end;
$$;
revoke all on function public.portal_save_project(uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.portal_save_project(uuid,integer,jsonb) to authenticated;
commit;
