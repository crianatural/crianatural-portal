-- Crie o usuário do cliente em Authentication > Users primeiro.
-- Substitua os dois valores abaixo; execute uma vez por cliente/projeto.
-- Obtenha o ID em Table Editor > portal_projects > id.
do $$
declare client_id uuid; target_project uuid;
begin
 target_project:='SUBSTITUA_PELO_UUID_DO_PROJETO'::uuid;
 select id into client_id from auth.users where lower(email)=lower('SUBSTITUA_PELO_EMAIL_DO_CLIENTE');
 if client_id is null then raise exception 'Usuário cliente não encontrado.'; end if;
 if not exists(select 1 from public.portal_projects where id=target_project) then raise exception 'Projeto não encontrado.'; end if;
 insert into public.portal_members(project_id,user_id,role) values(target_project,client_id,'client');
end $$;
