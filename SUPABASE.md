# Ativar o portal conectado

O código já contém login por e-mail/senha e persistência compartilhada no Supabase. A configuração remota ainda precisa ser executada no painel pelo proprietário. Nenhum dado local demonstrativo é enviado automaticamente.

## 1. Criar tabelas e permissões

No seu projeto, abra **SQL Editor**, crie uma consulta e cole o conteúdo de `supabase/01-schema.sql`. Execute uma vez. O script usa transação: qualquer falha desfaz as alterações daquela execução. Se já tiver executado com sucesso, não rode novamente.

Este MVP usa duas tabelas: `portal_projects` armazena o estado do projeto em JSON (etapas, informações, histórico e links); `portal_members` vincula usuários aos projetos. É uma escolha para manter a integração pequena e permitir gravação atômica, sem substituir coleções em várias requisições. Há validação de estrutura no banco.

Todas as tabelas têm RLS. Visitantes não leem dados; clientes vinculados leem somente seus projetos; administradores vinculados editam somente seus projetos. Somente o proprietário pelo painel/SQL atribui papéis. O frontend não tem permissão para criar membros, mudar papéis ou criar/excluir projetos.

## 2. Criar seu acesso administrativo

Em **Authentication > Users**, use a ação para adicionar/criar um usuário com seu e-mail e uma senha forte. Defina a senha diretamente no Supabase; não compartilhe no chat. Este fluxo inicial usa contas criadas pelo proprietário, sem cadastro público no aplicativo. Desative novos cadastros públicos nas configurações de Auth se não forem necessários.

Abra `supabase/02-primeiro-projeto.sql`, substitua `SUBSTITUA_PELO_SEU_EMAIL` e execute no SQL Editor. Isso cria um projeto DM Construções vazio, com textos a cadastrar, e concede administração ao seu usuário. Não são criados percentuais, histórico ou entregas fictícias. Começará em 0%, sem etapas.

## 3. Configurar o frontend

O arquivo `.env.local` preparado nesta entrega contém a URL e a chave publicável fornecidas pelo proprietário. Ele é ignorado pelo Git e não está no ZIP. Copie `.env.example` para `.env.local` se instalar a partir do ZIP e preencha os valores públicos.

```sh
npm ci
npm run dev
```

Reinicie o servidor se alterar as variáveis. `VITE_PORTAL_MODE=supabase` ativa o login. Configuração ausente mostra aviso, sem cair silenciosamente nos exemplos. `?demo=1` abre a demonstração local isolada. Essa demonstração não consulta nem altera o banco.

Para publicar: configure as mesmas três variáveis no serviço de hospedagem e execute `npm run build`. Publique `dist/`. As variáveis VITE são incorporadas à compilação; mudar apenas o ambiente após compilar não altera o bundle.

## 4. Dar acesso ao cliente

Crie a conta do cliente em Authentication > Users. Depois execute `supabase/03-vincular-cliente.sql`, substituindo o UUID do projeto e o e-mail do cliente. Entregue as credenciais por um canal adequado. O link `/#/cliente` exige login e mostra somente os projetos aos quais a conta pertence. O link não concede acesso sozinho.

Se a conta tiver vários projetos, aparece um seletor. Para revogar acesso, remova a vinculação em `portal_members` pelo painel. Não altere para admin a conta de um cliente.

## Comportamento

- Login por senha, sessão persistida pelo SDK e logout. Não há cadastro, convite por e-mail ou recuperação automática de senha no frontend nesta versão; o proprietário gerencia as contas no painel.
- Gravações são confirmadas no banco antes de mostrar sucesso. Erros preservam os dados do formulário.
- A função SQL executa como o usuário conectado (`security invoker`) e respeita RLS.
- Revisão numérica evita que dois administradores sobrescrevam silenciosamente a mesma versão. Se houver conflito, copie a edição e use **Atualizar dados** antes de refazê-la.
- Os dados são compartilhados entre dispositivos, mas a tela não faz assinatura Realtime: o cliente usa **Atualizar dados** ou recarrega para buscar novas alterações. Não há promessa de atualização instantânea.
- O progresso continua calculado a partir das etapas. Projetos vazios ficam em 0%.
- Restaurar exemplos só existe no modo demo. Importar JSON no modo conectado substitui o projeto compartilhado após confirmação; use com cuidado. O histórico no JSON é editorial, não uma auditoria inviolável.
- Links de documentos continuam apontando a serviços externos; não há Supabase Storage nesta versão. As permissões desses serviços devem ser configuradas à parte.

## Verificação obrigatória antes de usar com clientes

1. Entrar como administrador, criar uma etapa e salvar; sair e entrar de novo: etapa preservada.
2. Entrar como cliente vinculado em outro navegador: projeto visível, sem administração; acesso direto a `/#/admin` deve continuar somente leitura.
3. Testar com outro usuário sem vínculo: nenhum projeto visível.
4. Confirmar por requisição autenticada que o cliente não consegue alterar `portal_projects` nem inserir/alterar `portal_members`. A autorização deve ser garantida pelo banco.
5. Abrir duas sessões administrativas na mesma versão, salvar na primeira e tentar salvar na segunda: deve ocorrer conflito, sem sobrescrita.
6. Revogar o vínculo e recarregar: os dados não devem ser retornados novamente.

Não coloque Secret key ou service_role em variáveis VITE. A chave publicável não substitui login e RLS.

Referências oficiais: https://supabase.com/docs/guides/auth/quickstarts/react e https://supabase.com/docs/guides/database/postgres/row-level-security.
