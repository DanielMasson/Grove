// Regras puras do kanban: coluna de conclusão, prioridade e prazo.
// Fáceis de testar no console (spec 03, seção 10).

/**
 * A coluna é a de conclusão? O Foco esconde as tarefas dela.
 * @param {import('../types.js').Column | undefined} column
 * @returns {boolean}
 */
export const isDoneColumn = (column) => Boolean(column?.isDone)

/**
 * A tarefa está numa coluna de conclusão?
 * @param {import('../types.js').Task} task
 * @param {import('../types.js').Column[]} columns
 * @returns {boolean}
 */
export const isDoneTask = (task, columns) =>
  isDoneColumn(columns.find((c) => c.id === task.columnId))

/**
 * Data de hoje no fuso local, como string `YYYY-MM-DD` (comparável com `dueDate`).
 * Nunca usar `toISOString()` aqui: ele é UTC e erra à noite.
 * @returns {string}
 */
export function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Prazo vencido (anterior a hoje). A coluna de conclusão é quem decide se conta —
 * passe `done` já calculado.
 * @param {import('../types.js').Task} task
 * @param {boolean} done
 * @returns {boolean}
 */
export function isTaskOverdue(task, done) {
  return Boolean(task.dueDate) && !done && task.dueDate < todayLocal()
}

/** @type {Record<import('../types.js').Priority, string>} */
export const PRIORITY_LABELS = { baixa: 'Baixa', media: 'Média', alta: 'Alta' }

/**
 * Prazo `YYYY-MM-DD` para exibição em pt-BR (sem deslocar por fuso).
 * @param {string} dueDate
 * @returns {string}
 */
export function formatDueDate(dueDate) {
  const [y, m, d] = dueDate.split('-')
  return `${d}/${m}/${y}`
}
