# Validação da entrega

Executada em 23/10/2026:

- Instalação de dependências concluída, com package-lock.json gerado.
- `npm test`: 3 testes aprovados (progresso, coerência dos status, validação de importação e URLs).
- `npm run build`: compilação de produção concluída com Vite 6.4.5.
- Servidor local Vite iniciado; requisição HTTP retornou 200.

O navegador integrado não conseguiu alcançar a prévia local (timeout). Portanto, a verificação visual desktop/celular e os fluxos completos de edição, recarga, importação/exportação e persistência no navegador não foram executados. O README contém roteiro manual para esses cenários. Não houve implantação externa nem configuração remota do Supabase/Auth.


## Integração Supabase preparada

Compilação com o SDK oficial aprovada. Três testes de regras de negócio aprovados. O SQL foi executado em PostgreSQL local via PGlite, com Auth simulado para verificar as políticas: administrador grava; cliente lê e não grava; usuário sem vínculo não lê; anon não tem acesso; promoção e criação de membros pelo cliente são bloqueadas; gravações concorrentes rejeitam revisão antiga; vínculo revogado perde leitura; estado inválido é rejeitado. Os scripts de primeiro projeto e vínculo também foram executados nesse ambiente local.

Ainda não foram executados scripts no Supabase do proprietário, criadas contas nem testado login real. O checklist de validação remoto está em SUPABASE.md.
