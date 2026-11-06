# Spec 01: Foco (cronômetro, árvore e vínculo)

> Responsável: _(definir)_ · Pasta: `src/features/focus/` · Requisitos: RF01 a RF06, RNF01, RNF03, RNF04, RNF05, RNF07
> Antes de começar, leia `AGENTS.md` e `src/types.js`. Itens **[CONFIRMAR]** são interpretações minhas das respostas do grupo (seção 14).

## 1. Objetivo
Permitir que o usuário inicie uma sessão de foco de duração escolhida, veja uma árvore crescendo em tempo real e, ao concluir,
registre a sessão (que alimenta Floresta e Gráficos). A sessão pode ser vinculada a uma tarefa e/ou a um caderno.

## 2. Regras de negócio (já decididas)
1. Duração escolhida pelo usuário: **mínimo 15 min, máximo 120 min** (presets 15, 25, 45, 60 e 120, mais valor personalizado dentro do intervalo).
2. Pode **pausar**, **retomar** e **desistir**. **Pausar só é possível depois de 10 min de foco** (`PAUSE_AFTER_MINUTES`); a pausa em si **não tem limite de tempo**. **[CONFIRMAR]**
3. **Desistir** descarta a sessão e a árvore. Nada é salvo (sem histórico de desistência).
4. **Fechar ou recarregar a aba** mata a sessão e a árvore. Nada é salvo. Por isso a sessão ativa fica só em memória (já implementado em `useTimer.js`).
5. Só sessões **concluídas** vão para `sessions` no store.
6. O tempo é calculado por **diferença de horários** (`Date.now()`), nunca por contagem de ticks do `setInterval` (RNF04).
7. Vínculo opcional com **tarefa** e/ou **caderno**. Se houver tarefa, o caderno é o da tarefa (toda tarefa pertence a um caderno).
8. O **bioma** da árvore vem do caderno vinculado. Sem caderno, usa **planície** (`DEFAULT_BIOME`). Cada bioma tem várias espécies (`src/biomes/config.js`).
9. O usuário **escolhe a espécie** antes de iniciar (dentro do bioma).
10. A árvore tem 4 estágios (`GROWTH_STAGES`: broto, muda, jovem, adulta). **Cada 30 min de foco rendem 1 estágio, arredondando para cima**: 15 min = 1, 45 min = 2, 75 min = 3, 120 min = 4 (função `stagesForMinutes`). **[CONFIRMAR]**
11. Ao iniciar, o usuário escolhe: **plantar uma árvore nova** ou **continuar evoluindo uma árvore existente** (só aparecem árvores abaixo do estágio 4). Ao concluir, a árvore existente ganha os estágios da sessão (limite 4); a árvore nova nasce com esses estágios.
12. **Computador dormindo não conta como aba fechada**: a sessão continua pelo cálculo de horários e pode concluir ao acordar.

## 3. Arquivos a criar/alterar
| Arquivo | O que fazer |
|---|---|
| `FocusPage.jsx` | Tela principal: estados *ocioso*, *em andamento*, *pausado*, *concluída*. |
| `useTimer.js` | Já existe. Pode receber `species` no `start`. Não persistir no storage. |
| `useSessionWatcher.js` | **Novo.** Hook que roda no `App.jsx` (não na FocusPage), checa a cada 250 ms se `progress() >= 1` e conclui a sessão. |
| `DurationPicker.jsx` | Presets + campo personalizado. |
| `LinkPicker.jsx` | Selects de tarefa e caderno (tarefa define o caderno). |
| `SpeciesPicker.jsx` | Escolha da espécie dentro do bioma do caderno (ou planície). |
| `TreePicker.jsx` | **Novo.** Opção "Plantar nova árvore" ou "Continuar uma árvore existente" (lista de árvores com estágio < 4, mostrando espécie, bioma e estágio). Se escolher uma existente, a espécie e o bioma dela são usados e o `SpeciesPicker` fica travado. |
| `TreeSvg.jsx` | Recebe `species`, `stage` (0 a 4, sendo 0 a semente) e `progress` (0..1) e desenha o SVG. Pasta de arte em `src/biomes/trees/`. |
| `CompletionDialog.jsx` | Mensagem de conclusão ("Árvore plantada!") com botão para ir à Floresta. |

**Por que o watcher no `App.jsx`:** o usuário pode navegar para Tarefas ou Cadernos durante a sessão. Se a conclusão dependesse da FocusPage montada,
a sessão nunca fecharia. O estado do timer é global (Zustand), então o watcher deve ser global também.

## 4. Estados da tela
| Estado | Condição | Conteúdo |
|---|---|---|
| Ocioso | `active === false` | Duração, vínculo, espécie, botão **Plantar** (iniciar). |
| Em andamento | `active && !pausedAt` | Árvore crescendo, tempo restante `mm:ss`, botões **Pausar** e **Desistir**. |
| Pausado | `active && pausedAt` | Igual ao anterior, com selo "Pausado" e botão **Retomar**. |
| Concluído | acabou de completar | `CompletionDialog` e volta ao estado ocioso ao fechar. |

## 5. Fluxo detalhado
**Iniciar**
1. Validar duração: inteiro entre `MIN_MINUTES` (15) e `MAX_MINUTES` (120). Mensagem de erro clara em português, sem `alert`.
2. Chamar `useTimer.start(minutes, { biome, species, taskId, notebookId, treeId })`. `treeId` só é enviado se o usuário escolheu evoluir uma árvore existente.
3. Mudar o título da aba para `🌱 24:59 · Grove` e atualizar a cada segundo.

**Durante**
- Tempo restante = `minutes*60000 - elapsedMs()`, arredondado para cima (mostrar `00:01` até zerar).
- O re-render visual pode ser a cada 250 ms (`setInterval` só para redesenhar; o valor vem de `Date.now()`).
- A árvore cresce **do estágio inicial até o estágio final da sessão**. Estágio inicial = estágio atual da árvore escolhida (ou 0, um terreno com semente, se for nova). Estágio final = `min(4, inicial + stagesForMinutes(minutes))`.
  Estágio exibido = `inicial + floor(progress * (final - inicial))`, interpolando o desenho entre estágios. Ex.: sessão de 120 min em árvore nova passa por broto, muda, jovem e adulta, um a cada 25% do tempo.
  A transição deve ser suave (CSS `transition` ou animação SVG) e respeitar `prefers-reduced-motion`.

**Pausar/Retomar**: congela o `elapsedMs`; a árvore não cresce enquanto pausado. O botão **Pausar** fica desabilitado até 10 min de foco (use `canPause()` e mostre uma dica "Disponível após 10 min" com `aria-describedby`). Não há limite de tempo pausado.

**Desistir**
1. Abrir confirmação ("Se desistir, a árvore morre e a sessão não será salva. Continuar?").
2. Se confirmar: `giveUp()`, animação curta de árvore murchando (opcional), voltar ao estado ocioso. **Nenhum dado é salvo.**

**Concluir** (feito pelo watcher quando `progress() >= 1`)
1. Chamar `useStore.completeSession({ minutes, taskId, notebookId, biome, species, treeId })`. O store planta a árvore nova ou evolui a existente e grava a `Session` com `treeId` e `stagesGained`. **Nunca** manipule `trees` direto na tela.
2. Resetar o timer (`giveUp()` sem confirmação, ou criar `complete()` no hook).
3. Disparar o `CompletionDialog` ("Árvore plantada!" ou "Sua árvore subiu para o estágio X!").
4. Tocar som opcional (extra, desligado por padrão).

## 6. Vínculo com tarefa/caderno
- Selects com **rótulo visível** ("Tarefa", "Caderno").
- Escolher uma tarefa seleciona automaticamente o caderno dela e **trava** o select do caderno (mostrar o motivo).
- Escolher só um caderno lista todas as espécies do bioma dele.
- Sem vínculo: usar a **planície** (`DEFAULT_BIOME`).
- Tarefas já na coluna "Concluído" não aparecem na lista.
- Se o usuário não tem cadernos ainda, mostrar chamada para criar um (link para `#/cadernos`), sem bloquear o foco.

## 7. Casos de borda
| Caso | Comportamento esperado |
|---|---|
| Aba em segundo plano | O tempo continua correto (diferença de horários). |
| Computador dormiu e acordou | **Decidido:** não conta como aba fechada. Pelo cálculo por horário a sessão continua e, se o tempo já passou, conclui ao acordar (o watcher roda em seguida). |
| Navegar para outra tela | A sessão continua; o watcher global conclui; mostrar aviso/ícone no menu enquanto ativa. |
| Fechar/recarregar a aba | Aviso do navegador (`beforeunload`, já em `App.jsx`). Se confirmar, sessão e árvore se perdem. |
| Tarefa ou caderno excluídos durante a sessão | Concluir normalmente, salvando o vínculo se ainda existir; senão sem vínculo. |
| Duas abas abertas | **Não suportado** (decidir se vale avisar). As sessões são independentes em memória; o `localStorage` é compartilhado, então cuidado com sobrescrita. |
| `StrictMode` em dev | Efeitos rodam duas vezes: o watcher deve ser idempotente (não pode adicionar a sessão duas vezes). Use a flag `active` como trava. |

## 8. Interface e acessibilidade
- Layout centrado, árvore grande no meio, tempo em fonte grande e legível.
- Container do tempo com `role="timer"`. **Não** use `aria-live` por segundo (irrita leitores de tela); anuncie só ao concluir e a cada minuto, se quiser.
- Botões com texto claro: **Plantar**, **Pausar**, **Retomar**, **Desistir**. Foco visível e navegação por teclado.
- Cores só via `var(--...)`. Contraste mínimo AA.
- Mobile: botões grandes (mín. 44 px), layout em coluna.
- Textos do usuário (nomes de tarefa/caderno) sempre como texto (React já escapa; nunca `dangerouslySetInnerHTML`).

## 9. Árvore (SVG)
- Um componente por espécie ou um componente parametrizável (`TreeSvg`) com paleta por espécie.
- Entrada: `species: string`, `stage: 0|1|2|3|4`, `progress: number`.
- Entrega mínima (MVP): 1 espécie por bioma × 4 estágios, em SVG. Depois, as demais espécies.
- Pedir à IA: "SVG de um pinheiro em 4 estágios de crescimento, viewBox 0 0 200 200, paleta verde/azul calma, sem texto, formas simples, sem gradientes pesados".
- A arte deve ficar em `src/biomes/trees/`, para reaproveitar na Floresta.

## 10. Critérios de aceite (checklist para o PR)
- [ ] Inicia sessão com os presets e com valor personalizado entre 15 e 120; valor fora do intervalo mostra erro.
- [ ] Pausar só habilita após 10 min de foco; pausar e retomar não perdem tempo.
- [ ] Concluir 45 min em árvore nova gera árvore de estágio 2; concluir 120 min em árvore de estágio 2 a deixa no estágio 4 (limite).
- [ ] Escolher "continuar árvore" evolui a existente e **não** cria árvore nova.
- [ ] Pausa e retoma sem perder tempo; o tempo restante bate com o relógio.
- [ ] Trocar de aba do navegador por 2 min e voltar: o tempo está correto.
- [ ] Navegar para outra tela e voltar: o timer continua; a sessão conclui mesmo fora da FocusPage.
- [ ] Concluir adiciona **exatamente uma** sessão ao store e ela aparece após recarregar a página.
- [ ] Desistir pede confirmação e não salva nada.
- [ ] Recarregar durante a sessão mostra o aviso e, ao confirmar, nada é salvo.
- [ ] Vínculo com tarefa define o caderno e o bioma; sem vínculo usa a planície.
- [ ] Funciona em 360 px de largura e no teclado.
- [ ] Sem erros no console; `npm run build` passa.

## 11. Testes manuais rápidos
Para testar sem esperar 15 min, use uma constante `DEV_SPEED = 60` (relógio 60x mais rápido, só em `import.meta.env.DEV`) **removível**, que o grupo apaga antes da entrega. Nunca deixe isso ativo no build de produção.

## 12. Dependências com outras telas
- **Tarefas/Cadernos** fornecem as listas para os selects (via `useStore`).
- **Floresta/Gráficos** leem `sessions`; `species` e `biome` precisam estar corretos aqui.
- Mudou o formato de `Session` em `types.js`? Avise Floresta e Gráficos.

## 13. Dicas para trabalhar com IA
- Peça um arquivo por vez (primeiro `useSessionWatcher`, depois `DurationPicker`, e assim por diante).
- Sempre cole `AGENTS.md` e `types.js` no início do prompt.
- Revise o cálculo de tempo manualmente: a IA costuma voltar para contagem por `setInterval`.
- Cada integrante deve conseguir explicar no vídeo **por que** o tempo é por diferença de horários e **por que** o watcher é global.

## 14. Decisões pendentes (responder antes de codar)
### Decididas pelo grupo
Espécie escolhida pelo usuário · evoluir ou plantar nova é escolha do usuário · duração de 15 a 120 min · pausa liberada a partir de 10 min, sem limite de tempo · sem caderno usa planície · notebook dormindo não conta como aba fechada.

### Interpretações a confirmar
- **C1:** regra de estágios por duração: 30 min por estágio, arredondando para cima (15=1, 45=2, 75=3, 120=4). Confere com "15 min = 1 estágio, 120 min = 4"?
- **C2:** "pausa possível a partir de 10 minutos" = o botão Pausar só habilita depois de 10 min **de foco decorridos**. Era isso?
- **C3:** uma árvore tem no máximo 4 estágios. Árvore no estágio 4 não aparece mais para evoluir. Ok?
- **C4:** ao evoluir uma árvore existente, a espécie fica a dela (não se muda). Ok?
