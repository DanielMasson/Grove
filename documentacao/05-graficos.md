# Spec 05: Gráficos

> Responsável: _(definir)_ · Pasta: `src/features/stats/` · Requisitos: RF08 a RF10, RNF01, RNF05
> Antes de começar, leia `AGENTS.md` e `src/types.js`.
> **Pode começar já:** importe `src/seed.example.json` pelo botão "Importar dados" para ter sessões de teste.
> Instalar: `npm i chart.js react-chartjs-2`.

## 1. Objetivo
Mostrar quanto tempo de foco o usuário dedicou por **dia, semana, mês, caderno e tarefa**, a partir das sessões concluídas.

## 2. Dados (só leitura)
Fonte única: `useStore((s) => s.sessions)`, mais `notebooks` e `tasks` para os nomes.
- `Session`: `completedAt` (ISO, UTC), `minutes`, `notebookId?`, `taskId?`, `biome`.
- Só existem sessões **concluídas** (desistências nunca são salvas).
- **Esta tela não escreve no store.**

## 3. Regras
1. **Agrupar por data local, não UTC.** `completedAt` vem de `toISOString()` (UTC). Converta com `new Date(iso)` e use `getFullYear/getMonth/getDate` locais. Usar `iso.slice(0, 10)` faz uma sessão feita às 22h no Brasil cair no dia seguinte. Este é o erro mais provável da tela.
2. **Dia:** últimos N dias (ex.: 14), incluindo dias com zero minutos (eixo contínuo).
3. **Semana:** definir o início da semana **[CONFIRMAR C1]** (proposta: segunda-feira). Últimas N semanas.
4. **Mês:** últimos 6 ou 12 meses, com rótulo em português ("out/2026", via `toLocaleDateString('pt-BR', ...)`).
5. **Por caderno:** soma de minutos por `notebookId`; sessões sem caderno entram como "Sem caderno".
6. **Por tarefa:** soma por `taskId`; sessões sem tarefa ficam fora ou em "Sem tarefa" **[CONFIRMAR C2]**. Limitar às N tarefas com mais tempo (ex.: 10) e agrupar o resto em "Outras".
7. Mostrar o tempo em minutos ou no formato "1 h 25 min" (função `formatMinutes`) nos rótulos e tooltips.
8. Nomes de caderno/tarefa atuais vêm de `notebooks`/`tasks`. Se o item foi excluído, o vínculo na sessão já é `undefined`, então cai em "Sem caderno/tarefa".

## 4. Arquivos a criar
| Arquivo | O que fazer |
|---|---|
| `StatsPage.jsx` | Seletor de visão (dia, semana, mês, caderno, tarefa), gráfico e tabela. Estado vazio. |
| `statsData.js` | Funções puras de agregação (seção 5). |
| `FocusChart.jsx` | Wrapper de `react-chartjs-2` (barras) com opções comuns. |
| `StatsTable.jsx` | Tabela com os mesmos dados do gráfico. |
| `stats.css` | Estilos (só tokens). |

## 5. Funções puras sugeridas (testáveis no console)
```js
/**
 * @param {import('../../types.js').Session[]} sessions
 * @param {number} days quantos dias para trás, incluindo hoje
 * @param {Date} [today] injetável para teste
 * @returns {{ label: string, key: string, minutes: number }[]}
 */
export function minutesPerDay(sessions, days, today = new Date()) {}

export function minutesPerWeek(sessions, weeks, today = new Date()) {}
export function minutesPerMonth(sessions, months, today = new Date()) {}

/** @returns {{ id: string | undefined, label: string, minutes: number }[]} ordenado por minutos desc */
export function minutesByNotebook(sessions, notebooks) {}
export function minutesByTask(sessions, tasks, limit = 10) {}

/** 85 -> "1 h 25 min"; 45 -> "45 min" */
export function formatMinutes(minutes) {}
```
Dica de teste: com `seed.example.json` (25 min em 20/out e 45 min em 21/out de 2026), passe `today` fixo em 22/out/2026 e confira os totais.

## 6. Gráficos
- Barras para dia/semana/mês; barras horizontais (`indexAxis: 'y'`) para caderno/tarefa (nomes longos).
- Registrar só o necessário do Chart.js (`CategoryScale`, `LinearScale`, `BarElement`, `Tooltip`, `Legend`) para reduzir o bundle.
- Cores via tokens: Chart.js desenha em canvas e não entende `var(--primary)` direto. Ler com `getComputedStyle(document.documentElement).getPropertyValue('--primary')` e passar ao dataset (preparando para o modo escuro).
- `responsive: true`, `maintainAspectRatio: false` num container com altura definida; legível em 360 px.
- Eixo Y começa em 0 e tem título "Minutos".
- Respeitar `prefers-reduced-motion`: se ativo, `animation: false`.

## 7. Acessibilidade (RNF05)
- Gráfico em `<canvas>` é invisível para leitor de tela: use `role="img"` com `aria-label` resumindo ("Foco por dia nos últimos 14 dias: total de 3 h 10 min") **e** ofereça a **tabela com os mesmos dados** (visível ou em `<details>`), com `<caption>`.
- Seletor de visão como grupo de botões com `aria-pressed` ou `<select>` com rótulo.
- Não depender só de cor: rótulos nos eixos e valores na tabela.

## 8. Casos de borda
| Caso | Comportamento |
|---|---|
| Nenhuma sessão | Estado vazio: "Conclua uma sessão de foco para ver seus gráficos." com link para `#/foco`. |
| Visão sem dados no período | Gráfico com zeros e texto "Nenhum foco neste período". |
| Sessões de muitos dias | Limitar à janela escolhida; não renderizar centenas de barras. |
| Mudança de horário de verão / fuso | Usar data local; evitar somar 24 h em milissegundos para avançar dias (use `setDate(d.getDate() + 1)`). |
| Importar backup com sessões inválidas | O `sanitize` do store já filtra; as funções devem ignorar `minutes` não finito por segurança. |

## 9. Critérios de aceite
- [ ] Cinco visões (dia, semana, mês, caderno, tarefa) com totais corretos conferidos à mão com o seed.
- [ ] Uma sessão feita à noite cai no **dia local** certo.
- [ ] Dias sem foco aparecem com zero nas visões temporais.
- [ ] Tabela acessível com os mesmos números do gráfico; `aria-label` no gráfico.
- [ ] Concluir uma sessão no Foco atualiza os gráficos sem recarregar.
- [ ] Estados vazios tratados.
- [ ] Funciona em 360 px. `npm run build` passa; sem erros no console.

## 10. Ordem sugerida
1. `statsData.js` com testes manuais no console (é onde moram os bugs).
2. Tabela (mais fácil de validar números).
3. Gráfico de barras para dia.
4. Demais visões.
5. Tema por tokens e `prefers-reduced-motion`.

## 11. Decisões a confirmar
- **C1:** semana começa na segunda ou no domingo?
- **C2:** sessões sem tarefa aparecem como "Sem tarefa" no gráfico por tarefa?
- **C3:** mostrar também total e média por dia, e uma "sequência de dias" (streak)? (Extra, só se sobrar tempo.)
