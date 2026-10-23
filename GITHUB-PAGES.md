# Publicação no GitHub Pages

Destino preparado: repositório `crianatural/crianatural-portal`.

Publicação do repositório público autorizada pelo proprietário. Nenhuma alteração foi feita na Hostinger.

## Pacote pronto

- `src/` contém o código React, com caminhos do logo compatíveis com subpastas.
- `docs/` contém a versão de produção compilada com caminhos relativos para GitHub Pages.
- O `.env.local`, as senhas, os usuários e os dados do Supabase não devem ser enviados ao repositório.
- A versão compilada contém a Project URL e a chave **publicável**, necessárias para o navegador. Isso é esperado: RLS e Supabase Auth controlam o acesso aos dados.
- O modo demonstrativo contém exemplos identificados. A versão conectada não inclui cópias dos dados reais dos projetos.

## Publicar

1. Criar o repositório público com README inicial.
2. Enviar os arquivos do código e a pasta `docs/`, excluindo `.env.local`, `node_modules/` e `dist/`.
3. Em Settings > Pages, selecionar Deploy from a branch, branch `main` e pasta `/docs`.
4. Aguardar a implantação terminar e conferir a página de login, os arquivos de estilo e o logo.
5. Testar login e leitura com as contas existentes. O banco e as contas continuam no mesmo projeto Supabase.

Endereço do portal após implantação: `https://crianatural.github.io/crianatural-portal/`.

## Atualizar

Com `.env.local` preenchido, execute `npm ci`, `npm test` e `npm run build:pages`. Envie as mudanças do código e de `docs/` para `main`. O Pages publicará essa pasta novamente.

## Mudar para Hostinger depois

Execute `npm run build` e publique `dist/` na raiz do novo endereço. Não é necessário mover o banco, recriar as contas ou copiar os dados do Supabase. O domínio definitivo pode ser conectado à Hostinger quando for adquirido.
