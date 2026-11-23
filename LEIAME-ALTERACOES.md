# Alterações do Arthur (`02-arthur.md`)

Esta pasta espelha a estrutura do repositório: copie por cima (sem commitar ainda).
Arquivos **novos** estão marcados com (novo).

| Tarefa | Arquivos |
|---|---|
| B10 Modal | `src/components/Modal.jsx`, `src/styles/components.css` |
| B11 kanban acessível | `src/features/tasks/TaskCard.jsx`, `TasksPage.jsx`, `tasks.css` |
| B12 textos | `src/features/notebooks/NotebookDetailPage.jsx` |
| B13 index.html | `index.html` |
| F06 modo escuro | `src/styles/tokens.css`, `src/components/ThemeToggle.jsx` (novo), `src/components/theme-toggle.css` (novo), `src/App.jsx`, `src/features/stats/FocusChart.jsx`, `src/biomes/trees/tree.css` |
| F07 sequência e bioma | `src/features/stats/statsData.js`, `StatsPage.jsx`, `stats.css` |
| F08 testes | `vitest.config.js` (novo), `package.json`, `src/**/*.test.js` (novos) |
| F10 filtro por prazo | `src/lib/kanban.js`, `src/features/tasks/TasksPage.jsx` |
| F09 README | `README.md` |
| Correção extra | `src/lib/search.js`, `src/lib/sources.js` (busca agora ignora espaços nas pontas) |

## Antes de rodar
1. `npm install` (atualiza o `package-lock.json`; sem isso o `npm ci` do CI falha, pois entraram `vitest` e `jsdom`).
2. `npm test` e `npm run build`.

## O que ficou para vocês
- README: sobrenomes, links do site/repositório, requisitos copiados do documento de requisitos, capturas de tela (comentários `TODO` no arquivo) e a linha do Vanderlei na tabela.
- `ci.yml`: o Vanderlei acrescenta `npm test` (C01).
