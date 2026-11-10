# Spec 03: Tarefas (kanban)

> Responsável: _(definir)_ · Pasta: `src/features/tasks/` · Requisitos: RF11 a RF15, RNF01, RNF02, RNF05, RNF07
> Antes de começar, leia `AGENTS.md`, `src/types.js` e `00-estado-e-proximos-passos.md`. Itens **[CONFIRMAR]** estão na seção 12.
> **Pré-requisito:** a base de Cadernos (criar/listar) precisa existir, pois toda tarefa pertence a um caderno.

## 1. Objetivo
Kanban individual com colunas personalizáveis, prazo e prioridade. As tarefas alimentam o Foco (vínculo da sessão) e os Gráficos (tempo por tarefa).

## 2. Regras de negócio
1. Uma tarefa tem: título (obrigatório), descrição, prazo opcional (`YYYY-MM-DD`), prioridade (`baixa`, `media`, `alta`), coluna e **caderno obrigatório** (`Task` em `types.js`; hoje o campo é opcional no JSDoc, corrigir).
2. Colunas padrão: **A fazer**, **Em andamento**, **Concluído** (`defaultColumns` no store). O usuário pode **criar, renomear e remover** colunas.
3. A coluna `done` ("Concluído") é a que o Foco usa para esconder tarefas finalizadas. **[CONFIRMAR C1]** Proposta: ela não pode ser removida nem renomeada. Criar `isDoneColumn(column)` em `src/lib/` e usar também no `LinkPicker`.
4. Remover coluna **apaga as tarefas dela** (comportamento já existente em `removeColumn`). A tela deve mostrar quantas tarefas serão apagadas e pedir confirmação. Não permitir remover a última coluna.
5. Mover uma tarefa entre colunas e dentro da coluna preserva a ordem (`order`).
6. Excluir tarefa pede confirmação. As sessões já feitas ficam no histórico, sem vínculo (o store já faz isso).

## 3. Mudanças no store (combinar com quem cuida do storage)
O store tem `addTask`, `updateTask`, `removeTask` e as ações de coluna. Falta:
```js
/**
 * Move a tarefa para a coluna e posição indicadas e reindexa `order` das colunas afetadas.
 * @param {string} taskId
 * @param {string} toColumnId
 * @param {number} toIndex posição dentro da coluna de destino (0 = topo)
 */
moveTask: (taskId, toColumnId, toIndex) => {}
```
Observações:
- `addTask` usa `order: s.tasks.length`. Passe a calcular a ordem **dentro da coluna** (último + 1).
- `renameColumn`/`addColumn` devem aplicar `trim` e rejeitar nome vazio (validar também na UI).
- `importData` precisa sanitizar `tasks` e `columns` (ver `00-estado-e-proximos-passos.md`, item 2 das pendências).

## 4. Arquivos a criar
| Arquivo | O que fazer |
|---|---|
| `TasksPage.jsx` | Quadro com as colunas, botão "Nova tarefa", botão "Nova coluna", filtros. Estado vazio amigável. |
| `KanbanColumn.jsx` | Cabeçalho (nome, contagem, renomear, remover) e lista de cartões. |
| `TaskCard.jsx` | Título, caderno (nome), prazo, prioridade (texto + cor), ações: editar, excluir, **Focar**. |
| `TaskForm.jsx` | Modal de criar/editar. Campos: título, descrição, prazo, prioridade, caderno (obrigatório), coluna. |
| `ColumnForm.jsx` | Modal curto para criar/renomear coluna. |
| `tasks.css` | Estilos da tela (somente tokens). |

## 5. Arrastar e soltar (RF14)
Usar `@dnd-kit/core` e `@dnd-kit/sortable` (`npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`).
- Ativar **`KeyboardSensor`** além do `PointerSensor` (acessibilidade, RNF05), e configurar `PointerSensor` com `activationConstraint` de distância (ex.: 6 px) para não atrapalhar cliques e scroll no celular.
- **Alternativa obrigatória sem arrastar:** cada cartão tem um `<select>` "Mover para" (ou menu) com as colunas. Em telas de toque, arrastar é ruim e leitores de tela podem não anunciar bem; o select garante que tudo funcione.
- Anúncios do dnd-kit em português (`announcements`/`screenReaderInstructions`).
- Ao soltar, chamar `moveTask`. Nunca reordenar o array no estado local da tela.

## 6. Fluxos
**Nova tarefa**
1. Botão abre `TaskForm`. Título obrigatório (após `trim`, 1 a 120 caracteres). Caderno obrigatório; se não houver cadernos, mostrar link para `#/cadernos` e desabilitar o envio.
2. Coluna padrão: a primeira. Prioridade padrão: `media`.
3. Salvar chama `addTask`.

**Editar:** mesmo formulário preenchido, `updateTask`. **Excluir:** `ConfirmDialog`.

**Focar nesta tarefa:** link para `#/foco?taskId=ID`. O Foco precisa ler `taskId` da URL e pré-selecionar tarefa e caderno (alteração pequena em `FocusPage.jsx`, falar com quem cuida do Foco). Não mostrar o botão em tarefas da coluna "Concluído".

**Prazo:** destacar tarefas **atrasadas** (prazo anterior a hoje e fora de "Concluído") com texto "Atrasada" além da cor. Comparar datas como string `YYYY-MM-DD` com a data **local** de hoje, não com `toISOString()` (que é UTC e erra à noite).

**Filtros (RF15)** **[CONFIRMAR C2]**: por caderno, por prioridade e busca por título. Mostrar "N tarefas".

## 7. Casos de borda
| Caso | Comportamento |
|---|---|
| Caderno da tarefa excluído | O store apaga as tarefas dele; a tela só reflete. |
| Renomear coluna para nome já existente | Permitir, mas avisar. |
| Remover coluna com tarefas | Confirmação com contagem. |
| Tarefa sem caderno (dados antigos/importados) | Mostrar "Sem caderno" e exigir escolha ao editar. |
| Sessão de foco ativa vinculada à tarefa que é excluída | O store já trata no `completeSession` (vínculo só vale se existir). |
| Título muito longo | Quebrar linha (`overflow-wrap: anywhere`), sem estourar o cartão. |

## 8. Interface e acessibilidade
- Colunas lado a lado no desktop; no celular, **uma coluna por vez** (abas ou rolagem horizontal com foco visível), alvos de 44 px.
- Prioridade e atraso nunca só por cor: sempre texto ("Alta", "Atrasada").
- Cada coluna é uma região (`<section aria-labelledby>`) e a lista de cartões é `<ul>`.
- Texto de usuário sempre como texto (React escapa; nunca `dangerouslySetInnerHTML`).

## 9. Critérios de aceite
- [ ] Criar, editar e excluir tarefa (com confirmação ao excluir).
- [ ] Título e caderno obrigatórios; erros junto ao campo, sem `alert`.
- [ ] Criar, renomear e remover coluna; remover mostra quantas tarefas serão apagadas.
- [ ] Arrastar entre colunas e reordenar funciona com mouse, toque e **teclado**; o select "Mover para" também.
- [ ] Ordem persiste ao recarregar.
- [ ] Prazo e prioridade aparecem no cartão; atrasadas ficam sinalizadas por texto.
- [ ] "Focar" abre o Foco com tarefa e caderno já selecionados.
- [ ] Tarefa movida para "Concluído" some da lista do Foco.
- [ ] Funciona em 360 px. `npm run build` passa.

## 10. Ordem sugerida de implementação
1. `moveTask` e `isDoneColumn` (funções puras, testar no console).
2. Quadro estático com colunas e cartões (sem arrastar), `TaskForm` e exclusão.
3. Gestão de colunas.
4. Select "Mover para".
5. dnd-kit com teclado.
6. Prazo/atraso, filtros e botão Focar.

## 11. Dependências com outras telas
- **Foco** lê `tasks` e `columns` (e passa a aceitar `?taskId=`).
- **Gráficos** agrupam sessões por `taskId`.
- **Cadernos** apagam tarefas ao serem excluídos.

## 12. Decisões a confirmar
- **C1:** a coluna "Concluído" fica protegida (sem renomear/remover)? (Proposta: sim.)
- **C2:** quais filtros entram no MVP?
- **C3:** ao remover coluna, o usuário escolhe mover as tarefas para outra coluna em vez de apagá-las?
- **C4:** ao mover para "Concluído", registrar a data de conclusão? (Exigiria campo novo em `Task` e `schemaVersion`.)
