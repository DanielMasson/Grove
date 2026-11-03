# Grove: contexto para quem (ou o que) escrever código aqui

App web de foco (estilo Forest), tarefas (kanban individual) e cadernos de estudo.
Trabalho final de DW2. Roda 100% no navegador, publicado no GitHub Pages, sem back-end.

## Stack
React 18 + Vite + **JavaScript (JSX, sem TypeScript)**, react-router-dom (HashRouter), Zustand (persist).
Sugeridos: @dnd-kit (kanban), Chart.js + react-chartjs-2 (gráficos). Árvores e biomas em SVG.

## Regras (não quebrar)
1. Interface em **português do Brasil**. Código e nomes de variáveis podem ser em inglês.
2. **Só `src/store/useStore.js` acessa o localStorage.** As telas usam o hook `useStore`.
3. **`src/types.js` é o contrato de dados** (documentado em JSDoc `@typedef`). Mudou? Avise o grupo e atualize `schemaVersion` se quebrar compatibilidade.
4. **HashRouter, sempre.** `base: './'` no Vite. Não usar BrowserRouter.
5. Texto do usuário é só texto: nunca `dangerouslySetInnerHTML`. Links externos com `rel="noopener noreferrer"`.
6. Cores só via variáveis de `src/styles/tokens.css` (preparar para modo escuro depois). Paleta calma: verdes e azuis.
7. Acessibilidade: HTML semântico, rótulos em formulários, foco visível, contraste adequado, navegação por teclado.
8. Confirmar antes de excluir qualquer coisa.
9. Trabalhe só na sua pasta em `src/features/`. Componentes compartilhados em `src/components/`.

## Regras de negócio decididas
- **Cronômetro:** tempo calculado por diferença de horários (`Date.now()`), não por contagem de ticks.
  A sessão ativa fica **só em memória**: fechar/recarregar a aba mata a sessão e a árvore.
  Desistir também descarta tudo, **não se salva desistência**. Só sessões concluídas vão para `sessions`.
- **Vínculos:** uma sessão pode ter tarefa e caderno. Toda tarefa pertence a um caderno (matéria).
  Se a sessão tem tarefa, herda o caderno da tarefa.
- **Biomas:** cada caderno tem um bioma (`planicie`, `montanha`, `floresta`, `savana`). Cada bioma tem várias espécies
  de árvore (ver `src/biomes/config.js`). Sessão sem caderno usa bioma neutro (a definir).
- **Crescimento:** a árvore passa por estágios (`GROWTH_STAGES`). Estágios atingidos ficam salvos e novas sessões
  fazem a árvore evoluir (regra exata ainda em definição).
- **Kanban:** colunas personalizáveis (criar, renomear, remover).
- **Floresta:** a aba principal mostra cards-resumo por bioma; cada bioma tem sua aba/cena.
- **Backup:** exportar/importar JSON (já implementado em `BackupButtons`).

## Comandos
`npm install` · `npm run dev` · `npm run build` (vite build)

## Deploy
Push na `main` → GitHub Actions publica `dist/` no Pages (Settings > Pages > Source: GitHub Actions).
