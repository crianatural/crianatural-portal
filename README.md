# CriaNatural — Portal de acompanhamento

MVP funcional em React + Vite, em português, responsivo, com o logo SVG original recuperado da conversa de referência. O mockup anterior não estava disponível no histórico recuperado; a interface segue a direção clean verde/branco solicitada.

**Todos os dados iniciais são exemplos fictícios.** O nome DM Construções foi fornecido pelo solicitante. As etapas, mensagens e percentuais não descrevem um projeto real. Não existem datas ou documentos reais pré-cadastrados.

## Supabase + Auth

A integração agora está implementada no código. Veja [SUPABASE.md](SUPABASE.md) para executar o SQL, criar as contas e ativar o modo conectado. A configuração remota ainda não foi executada. As explicações sobre localStorage abaixo descrevem o modo demonstrativo.

## Executar

Requisitos: Node.js 22 LTS ou superior e npm.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente http://127.0.0.1:5173).

- Cliente: `/#/cliente`
- Administração demonstrativa: `/#/admin`
- Testes das regras de negócio: `npm test`
- Compilar: `npm run build`
- Conferir a compilação: `npm run preview`

O diretório `dist/` já acompanha a entrega como conveniência. Para executar essa versão sem instalar as dependências do projeto, com Node disponível: `npx serve dist`. Não abra o index.html diretamente via file://.

## Funcionalidades

- Área do cliente com visão geral, etapas, status, próxima ação, responsável, prazo opcional, histórico e documentos/links.
- Percentual geral calculado: soma dos percentuais das etapas / quantidade de etapas, arredondado. Todas têm peso igual. Sem etapas, 0%. Exemplo inicial: (100 + 100 + 60 + 0 + 0 + 0) / 6 = 43%.
- Status concluída fixa 100%; não iniciada fixa 0%; em andamento e aguardando cliente permitem 0–99%. Esse cálculo é real sobre os dados cadastrados; o sistema não mede a execução do trabalho automaticamente.
- Administração para editar informações gerais e próxima ação, criar/editar/remover etapas, publicar atualizações e adicionar/remover links HTTP(S). As edições geram registros datados no histórico.
- Prazo opcional, sem previsão fictícia automática. Data/hora das atualizações usa o relógio do dispositivo e é exibida no fuso local do navegador.
- Persistência via localStorage, com aviso de falha de escrita. Dados inválidos armazenados não quebram a abertura: são substituídos em memória pelos exemplos, sem sobrescrever automaticamente o conteúdo original.
- Abas abertas na mesma origem recebem alterações via evento storage. Edições simultâneas usam a última gravação, sem resolução de conflitos.
- Exportação/importação JSON validada, para backup manual. Importar e restaurar pedem confirmação antes da substituição.
- Copiar link do cliente. **O link não transporta os dados locais.** Em outro navegador/dispositivo, abre os exemplos padrão.
- Layout para desktop e celular, formulários com rótulos, foco visível e barras de progresso acessíveis. Fonte externa opcional do Google Fonts; o layout usa fonte local alternativa se estiver offline.

## Estrutura

```text
public/logo.svg       Logo original
src/main.jsx          Interface, formulários, navegação e persistência
src/model.js          Dados de exemplo, cálculo e validação
src/model.test.js     Testes das regras de negócio
src/style.css         Layout responsivo
index.html            Entrada da aplicação
package-lock.json     Dependências fixadas
dist/                 Resultado da compilação
```

## Implantar a demonstração

Execute `npm ci` e `npm run build`. Publique o conteúdo de `dist/` em uma hospedagem estática servida por HTTPS. Na configuração de build, use `npm run build` e diretório de saída `dist`.

As rotas usam hash (`/#/cliente`), dispensando reescrita de rotas no servidor. A entrega pressupõe hospedagem na raiz do domínio. Para hospedar em uma subpasta, ajuste a opção `base` do Vite e o caminho do logo em `src/main.jsx` antes de compilar novamente. Não houve publicação em serviço externo nesta entrega.

## Acesso e limites

O modo conectado oferece login, permissões por projeto no banco, salvamento compartilhado e controle de conflito. Clientes vinculados leem; administradores vinculados editam. Contas e vínculos são gerenciados pelo proprietário no Supabase. Consulte SUPABASE.md.

Sem configuração Supabase, o modo demo continua usando localStorage e não tem autenticação. Nunca confunda o modo demo com dados compartilhados.

Não há assinatura Realtime: use Atualizar dados para buscar alterações. Não há upload, notificações, recuperação automática de senha ou auditoria inviolável nesta versão.

## Roteiro para conferir

1. Abra a área do cliente: progresso inicial 43%, seis etapas e nenhum documento.
2. Entre em Administração demo, edite Direção visual para concluída e salve: o total passa a 50%.
3. Volte à área do cliente: etapa e histórico atualizados. Recarregue: os dados permanecem.
4. Atualize responsável, próxima ação e prazo. Confira na visão geral.
5. Adicione uma atualização e um link de teste. Confira em Atualizações e Documentos.
6. Exporte o JSON, restaure a demonstração e importe o arquivo para recuperar suas alterações.
7. Abra outro navegador: ele terá armazenamento independente, como sinalizado na interface.

## Validação da entrega

Consulte `VALIDACAO.md` para os comandos executados e as limitações da verificação.
