# Grove: estado atual e próximos passos

> Leia junto com `AGENTS.md`, `src/types.js` e as specs 01 a 06. Atualize a tabela da seção 1 a cada PR mergeado.

## 1. Em que estágio o projeto está

**Fase atual: infraestrutura e primeira tela (Foco) prontas; as outras quatro telas ainda são esqueleto.**

| Área | Estado | Evidência no código |
|---|---|---|
| Infra (Vite, HashRouter, deploy no Pages, tokens CSS, `Modal`, `ConfirmDialog`) | **Pronto** | `vite.config.js`, `deploy.yml`, `App.jsx`, `components/` |
| Store (Zustand + persist, export/import, `completeSession`, CRUD de caderno, fonte, coluna, tarefa) | **Pronto, com lacunas** (seção 3) | `store/useStore.js` |
| Contrato de dados | **Pronto** | `types.js` (`schemaVersion: 1`) |
| Biomas e árvores SVG | **Pronto** (4 biomas, 8 espécies, 4 estágios) | `biomes/config.js`, `TreeSvg.jsx` |
| **Foco** (spec 01) | **Implementado, falta validar o checklist** | `FocusPage`, pickers, `useTimer`, `useSessionWatcher`, `CompletionDialog` |
| **Cadernos** (spec 02) | **Base pronta** (criar, listar, bioma, editar, excluir com impacto e bloqueio com sessão ativa, busca por nome/fonte). **Falta o resto**: fontes (SourceForm, YouTube, tags, busca no detalhe) | `NotebooksPage`, `NotebookCard`, `NotebookForm`, `BiomePicker`, `NotebookDetailPage`, `lib/search.js` |
| **Tarefas** (spec 03) | **Implementado** (CRUD, colunas com `isDone`, `moveTask`, dnd-kit com teclado, select "Mover para", filtros, prazo/atraso, botão Focar) | `features/tasks/*`, `lib/kanban.js`, `moveTask` no store |
| **Floresta** | **Só esqueleto**, sem spec | `ForestPage.jsx` |
| **Gráficos** | **Só esqueleto**, sem spec | `StatsPage.jsx` |
| Backup JSON | **Pronto** | `BackupButtons.jsx` |
| README / entrega | **Rascunho** | `README.md` |

Dependências ainda **não instaladas**: `chart.js` + `react-chartjs-2` (Gráficos). `@dnd-kit/*` já instalados (Tarefas).

## 2. Ordem de trabalho recomendada

O que desbloqueia o resto vem primeiro.

1. **Cadernos, base** (spec 02, seções 4 a 6, sem fontes ainda): criar, listar, bioma, excluir. ~~feito~~ Sem caderno não existe tarefa nem bioma além da planície.
2. **Fechar o Foco** (spec 01, seção 10): rodar o checklist inteiro e corrigir o que falhar. Isso pode andar em paralelo ao item 1.
3. **Tarefas** (spec 03): ~~feito~~ precisa de cadernos criados.
4. **Floresta** (spec 04) e **Gráficos** (spec 05): só leem `trees`/`sessions`. Dá para começar **agora**, usando `src/seed.example.json` (botão "Importar dados" carrega esse arquivo).
5. **Cadernos, fontes** (spec 02, resto): YouTube, tags, busca.
6. **Entrega** (spec 06): README, limpeza, vídeo.

Cada pessoa trabalha só na sua pasta em `src/features/` (regra 9 do `AGENTS.md`). Mudanças no store ou em `types.js` são combinadas com o grupo antes.

## 3. Pendências e riscos encontrados na leitura do código

Ordenadas por impacto.

1. **[RESOLVIDO — C1 "livre"]** A coluna de conclusão agora é o campo `isDone` em `Column` (sem quebrar `schemaVersion`; backups antigos migram via `migrate` do persist e via fallback no `sanitizeColumn`). `isDoneColumn` está em `src/lib/kanban.js` e é usada por Foco e Tarefas. A coluna pode ser renomeada/removida; a UI marca a conclusão com a tag "Conclusão".
2. **[RESOLVIDO]** `importData` agora sanitiza `tasks` (`sanitizeTask`: título, `priority`, `columnId` existente, `dueDate` `YYYY-MM-DD`, `notebookId` só se existir) e `columns` (`sanitizeColumn`).
3. **[RESOLVIDO]** `notebookId` é obrigatório no formulário de tarefa (com link para `#/cadernos` se não houver cadernos); no JSDoc ficou documentado que dados antigos podem vir sem e aparecem como "Sem caderno" (spec 03, seção 7).
4. **[RESOLVIDO]** A UI de Tarefas usa `ConfirmDialog` com a contagem de tarefas da coluna; o store recusa remover a última coluna.
5. **[RESOLVIDO]** `moveTask(taskId, toColumnId, toIndex)` no store reindexa `order` das colunas afetadas; `addTask` calcula a ordem dentro da coluna.
6. **`QuotaExceededError` não é tratado** (spec 02, seção 10). O `persist` pode falhar silenciosamente com notas grandes. Envolver o storage do `persist` num `createJSONStorage` próprio com `try/catch` que avise o usuário para exportar o backup.
7. **[RESOLVIDO]** `FocusPage` lê `notebookId` **e** `taskId` da URL: `#/foco?taskId=ID` pré-seleciona tarefa e herda o caderno da tarefa (botão "Focar" das telas de Cadernos e Tarefas).
8. **Uma sessão ativa com o caderno excluído**: a spec 02 manda bloquear a exclusão enquanto há sessão ativa. Ler `useTimer.getState().active` em `NotebookDetailPage` antes de abrir o `ConfirmDialog` de exclusão.
9. **`DEV_SPEED = 60` em `useTimer.js`** só vale em `import.meta.env.DEV` e vira 1 no build, então é seguro, mas a spec 01 pede para o grupo **removê-lo antes da entrega** (spec 06).
10. **Duas abas abertas**: o `persist` não sincroniza entre abas e a última escrita ganha. Decidir se basta documentar no README ou mostrar um aviso.
11. **Detalhes menores**: o id `baobá` (com acento) funciona, mas é frágil em URLs e backups; considerar `baoba` (exige migração dos dados existentes, então só se ainda não houver usuários reais). Existem duas cópias de `AGENTS.md` (`documentacao/` e `grove/`); manter uma só. As specs citam `docs/specs/`, mas a pasta se chama `documentacao/`.

## 4. Checklist de PR (vale para todas as telas)

- [ ] Interface em português; sem `alert` para erros de formulário.
- [ ] Cores só via `var(--...)`; nenhuma cor nova hardcoded fora de `tokens.css` (exceto as das espécies/biomas em `biomes/`).
- [ ] Todo campo com `<label>`; foco visível; navegável só com teclado.
- [ ] Confirmação antes de excluir qualquer coisa.
- [ ] Nenhum acesso direto a `localStorage` fora do store.
- [ ] Funciona em 360 px.
- [ ] `npm run build` passa e o console está sem erros.
- [ ] Se mexeu em `types.js`, avisou o grupo (e subiu `schemaVersion` se quebrou compatibilidade).

## 5. Como trabalhar com IA neste repositório

- Cole sempre `AGENTS.md`, `types.js` e a spec da tela no início do prompt.
- Peça **um arquivo por vez** e revise antes do próximo.
- Peça funções puras (agregações de gráfico, busca, `parseYouTubeId`): são fáceis de testar no console e de explicar no vídeo.
- Revise sempre: tempo por `Date.now()` (nunca contagem de ticks), ausência de `dangerouslySetInnerHTML`, validação de URL.
