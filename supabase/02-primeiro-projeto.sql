-- Depois de executar 01-schema.sql e criar seu usuário em Authentication > Users.
-- Troque somente o e-mail abaixo pelo e-mail EXATO da sua conta administrativa.
-- Este script aborta se o usuário não existir. Nunca usa a chave pública para conceder acesso.
do $$
declare admin_id uuid; project_id uuid;
begin
 select id into admin_id from auth.users where lower(email)=lower('SUBSTITUA_PELO_SEU_EMAIL');
 if admin_id is null then raise exception 'Crie o usuário e substitua o e-mail antes de executar.'; end if;
 if exists(select 1 from public.portal_members where user_id=admin_id and role='admin') then
  raise exception 'Já existe um projeto administrado por esta conta. Não execute novamente para evitar duplicação.';
 end if;
 insert into public.portal_projects(state) values (
  '{"version":1,"project":"Site institucional","client":"DM Construções","summary":"Informações do projeto a cadastrar.","action":"Próxima ação a definir.","owner":"Responsável a definir.","due":"","stages":[],"updates":[],"documents":[]}'::jsonb
 ) returning id into project_id;
 insert into public.portal_members(project_id,user_id,role) values (project_id,admin_id,'admin');
 raise notice 'Projeto criado: %. Vincule os clientes a esse ID.',project_id;
end $$;
