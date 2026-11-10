# Spec 06: Fechamento e entrega

> Responsável: todo o grupo, com uma pessoa coordenando · Requisitos: todos os RNF
> Faça isto **depois** que as telas estiverem funcionando. Reserve pelo menos uma semana antes do prazo.

## 1. Congelar funcionalidades
- Definir uma data de corte. Depois dela, só correção de bug.
- Qualquer item **[CONFIRMAR]** ainda aberto nas specs vira decisão do grupo agora e é anotado no próprio arquivo.

## 2. Limpeza do código
- [ ] **Remover `DEV_SPEED`** de `src/features/focus/useTimer.js` (hoje vale 60 só em dev e 1 no build, mas a spec 01 pede para apagar). Conferir que o cronômetro de 15 min dura 15 min de verdade.
- [ ] Buscar `console.log`, `TODO`, `debugger` e código comentado: `grep -rn "TODO\|console.log" src`.
- [ ] Buscar `dangerouslySetInnerHTML` (deve dar zero resultados) e `localStorage` fora de `useStore.js` (zero).
- [ ] Buscar `BrowserRouter` (zero; é `HashRouter`).
- [ ] Conferir que não há cores hardcoded fora de `tokens.css` e `biomes/`.
- [ ] Manter **uma** cópia do `AGENTS.md` e corrigir caminhos citados nas specs (`docs/specs/` vs `documentacao/`).
- [ ] Decidir o destino de `seed.example.json` (manter como exemplo no repositório está ok).

## 3. Testes de ponta a ponta (manual)
Rodar com **dados limpos** (`localStorage.clear()` ou aba anônima) e depois com o seed importado.
1. Criar caderno com bioma, adicionar fontes (link, YouTube, nota).
2. Criar tarefa nesse caderno, mover pelo kanban, abrir Foco pelo botão "Focar".
3. Sessão de 15 min completa (sem aceleração): árvore plantada, diálogo, aparece na Floresta e nos Gráficos.
4. Evoluir uma árvore existente até o estágio 4; ela some da lista de evolução.
5. Pausar após 10 min, retomar; desistir (com confirmação) não salva nada.
6. Navegar para outras telas durante a sessão; ela conclui mesmo assim.
7. Excluir caderno com tarefas e sessões: confirmação mostra o impacto; histórico de foco fica sem vínculo.
8. Exportar backup, limpar tudo, importar: tudo volta. Importar um JSON adulterado (biome inválido, URL `javascript:`, tarefa sem título) não quebra o app.
9. Recarregar a página: dados persistem; sessão ativa **não** persiste (de propósito).
10. Navegador e dispositivos: Chrome e Firefox no desktop; um celular (ou 360 px nas ferramentas do navegador).

## 4. Acessibilidade e desempenho
- [ ] Percorrer **todo** o app só com Tab/Shift+Tab/Enter/Espaço/Esc/setas.
- [ ] Foco visível em todos os elementos interativos; foco retorna ao botão de origem ao fechar modais.
- [ ] Rodar o Lighthouse (aba Acessibilidade) em cada rota e corrigir o que for apontado.
- [ ] Testar com `prefers-reduced-motion` ativado.
- [ ] Testar com zoom de 200% e fonte maior.
- [ ] `npm run build` sem avisos relevantes; conferir o tamanho do `dist/`.

## 5. Deploy
- [ ] Settings > Pages > Source: **GitHub Actions**.
- [ ] Push na `main` e acompanhar o workflow `Deploy para o GitHub Pages`.
- [ ] Abrir o link publicado e repetir os testes 3 e 8 **no site**, não só local.
- [ ] Recarregar uma rota interna (ex.: `#/tarefas`) no site publicado: deve abrir (HashRouter).
- [ ] Copiar o link do site e do repositório para o README.

## 6. README (preencher só o que existe de verdade)
Seguir o rascunho em `README.md`:
- Integrantes, link do site e do repositório.
- Objetivo, problema e público-alvo (estudantes que precisam de foco e organização por matéria).
- Tecnologias realmente usadas (incluir Chart.js e dnd-kit **somente** se entraram).
- Principais recursos: apenas o que passou nos critérios de aceite.
- Requisitos funcionais e não funcionais: copiar do documento de requisitos **removendo o que não foi feito**.
- Como acessar e usar (passo a passo curto, com 2 ou 3 capturas de tela).
- Como rodar localmente (`npm install`, `npm run dev`).
- Limitações conhecidas (ex.: dados só no navegador; sem sincronização entre abas ou dispositivos; fechar a aba mata a sessão de foco; limite de ~5 MB do `localStorage`).
- Participação de cada integrante, com base no histórico de commits e PRs.

## 7. Vídeo de apresentação
Roteiro sugerido (cada integrante explica a parte que fez e **por que** decidiu assim):
1. Problema e público (30 s).
2. Demonstração do fluxo completo: caderno, tarefa, foco, floresta, gráficos (3 a 4 min).
3. Decisões técnicas que precisam estar na ponta da língua:
   - Por que o tempo é calculado por **diferença de horários** e não por contagem de ticks.
   - Por que o **watcher** da sessão roda no `App.jsx` (global) e não na `FocusPage`.
   - Por que **só o store** acessa o `localStorage` e como o backup/validação de importação protege os dados.
   - Como as URLs são validadas (`safeHttpUrl`, só http/https) e por que isso evita XSS.
   - Como a acessibilidade foi tratada (teclado, rótulos, ARIA, alternativa ao arrastar).
4. Limitações e o que faria depois (30 s).

## 8. Checklist final
- [ ] Todos os critérios de aceite das specs 01 a 05 marcados.
- [ ] `DEV_SPEED` removido; sem `TODO`/`console.log`.
- [ ] Site publicado funcionando; link no README.
- [ ] README completo e honesto.
- [ ] Vídeo gravado e link anotado.
- [ ] Todos os integrantes com commits no repositório.
