# Grove: estado atual e próximos passos

> Leia junto com `AGENTS.md`, `src/types.js` e as specs 01 a 06. Atualize a tabela da seção 1 a cada PR mergeado.

## 1. Em que estágio o projeto está

**Fase atual: todas as telas das specs 01 a 05 implementadas; faltam validar os checklists de aceite e fechar a entrega (spec 06).**

| Área | Estado | Evidência no código |
|---|---|---|
| Infra (Vite, HashRouter, deploy no Pages, tokens CSS, `Modal`, `ConfirmDialog`) | **Pronto** | `vite.config.js`, `deploy.yml`, `App.jsx`, `components/` |
| Store (Zustand + persist, export/import, `completeSession`, CRUD de caderno, fonte, coluna, tarefa) | **Pronto** (aviso de armazenamento cheio: ver seção 3, item 6) | `store/useStore.js` |
| Contrato de dados | **Pronto** | `types.js` (`schemaVersion: 1`) |
| Biomas e árvores SVG | **Pronto** (4 biomas, 8 espécies, 4 estágios) | `biomes/config.js`, `TreeSvg.jsx` |
| **Foco** (spec 01) | **Implementado, falta validar o checklist** | `FocusPage`, pickers, `useTimer`, `useSessionWatcher`, `CompletionDialog` |
| **Cadernos** (spec 02) | **Implementado** (cadernos, bioma, excluir com impacto, fontes link/YouTube/nota, tags, busca) | `features/notebooks/*`, `lib/search.js`, `lib/sources.js`, `lib/youtube.js` |
| **Tarefas** (spec 03) | **Implementado** | `features/tasks/*`, `lib/kanban.js`, `moveTask` no store |
| **Floresta** (spec 04) | **Implementado** (resumo, cena por bioma, rota `/floresta/:biome`) | `features/forest/*` |
| **Gráficos** (spec 05) | **Implementado** (5 visões, tabela acessível). Exige `npm i chart.js react-chartjs-2` | `features/stats/*` |
| Backup JSON | **Pronto** | `BackupButtons.jsx` |
| README / entrega | **README preenchido; faltam integrantes, links, capturas e requisitos** | `README.md` |

## 2. Ordem de trabalho recomendada

1. ~~Cadernos, base~~ feito.
2. **Fechar o Foco** (spec 01, seção 10): rodar o checklist inteiro e corrigir o que falhar.
3. ~~Tarefas~~ feito.
4. ~~Floresta e Gráficos~~ feito.
5. ~~Cadernos, fontes~~ feito.
6. **Entrega** (spec 06): limpeza, testes de ponta a ponta, deploy, README final, vídeo.

Cada pessoa trabalha só na sua pasta em `src/features/` (regra 9 do `AGENTS.md`). Mudanças no store ou em `types.js` são combinadas com o grupo antes.

## 3. Pendências e riscos

1. **[RESOLVIDO]** Coluna de conclusão por `isDone` em `Column`.
2. **[RESOLVIDO]** `importData` sanitiza `tasks` e `columns`.
3. **[RESOLVIDO]** `notebookId` obrigatório no formulário de tarefa.
4. **[RESOLVIDO]** Confirmação ao remover coluna; o store recusa remover a última.
5. **[RESOLVIDO]** `moveTask` reindexa `order`; `addTask` calcula a ordem dentro da coluna.
6. **[RESOLVIDO no código; aplicar no `useStore.js`]** `QuotaExceededError`: `safeStorage` dentro do `useStore.js` (via `createJSONStorage`) dispara `grove:storage-error`, e `components/StorageWarning.jsx` avisa o usuário para exportar o backup.
7. **[RESOLVIDO]** `FocusPage` lê `notebookId` e `taskId` da URL.
8. **[RESOLVIDO]** `NotebookDetailPage` bloqueia a exclusão com sessão ativa ligada ao caderno.
9. **[RESOLVIDO]** `DEV_SPEED` removido de `useTimer.js`. Para testar sem esperar 15 min, use temporariamente uma sessão curta alterando `MIN_MINUTES` localmente (não commitar).
10. **Duas abas abertas**: o `persist` não sincroniza entre abas e a última escrita ganha. Documentado como limitação no README; decidir se mostra aviso.
11. **Detalhes menores**: o id `baobá` (com acento) é frágil em URLs e backups; considerar `baoba` (exige migração). Existem duas cópias de `AGENTS.md` (`documentacao/` e `grove/`); manter uma só. As specs citam `docs/specs/`, mas a pasta se chama `documentacao/`.

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
