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

const pad = (n) => String(n).padStart(2, '0')

/**
 * Data de hoje no fuso local, como string `YYYY-MM-DD` (comparável com `dueDate`).
 * Nunca usar `toISOString()` aqui: ele é UTC e erra à noite.
 * @returns {string}
 */
export function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Soma `days` dias a uma data `YYYY-MM-DD` (calendário local, sem deslocar por fuso).
 * @param {string} date
 * @param {number} days
 * @returns {string}
 */
export function addDaysLocal(date, days) {
  const [y, m, d] = date.split('-').map(Number)
  const next = new Date(y, m - 1, d + days)
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`
}

/**
 * Prazo vencido (anterior a hoje). A coluna de conclusão é quem decide se conta —
 * passe `done` já calculado.
 * @param {import('../types.js').Task} task
 * @param {boolean} done
 * @param {string} [today] `YYYY-MM-DD` local (padrão: hoje)
 * @returns {boolean}
 */
export function isTaskOverdue(task, done, today = todayLocal()) {
  return Boolean(task.dueDate) && !done && task.dueDate < today
}

/**
 * Opções do filtro "Prazo" (valor, rótulo). Valor vazio = sem filtro.
 * @type {[string, string][]}
 */
export const DUE_FILTERS = [
  ['', 'Todos'],
  ['atrasadas', 'Atrasadas'],
  ['hoje', 'Hoje'],
  ['7dias', 'Próximos 7 dias'],
  ['sem-prazo', 'Sem prazo'],
]

/**
 * A tarefa passa no filtro de prazo? Compara strings `YYYY-MM-DD` locais.
 * - `atrasadas`: prazo anterior a hoje; tarefa na coluna de conclusão (`done`) NUNCA é atrasada.
 * - `hoje`: prazo = hoje.
 * - `7dias`: de hoje até hoje + 7 dias (inclusive).
 * - `sem-prazo`: sem `dueDate`.
 * - vazio/desconhecido: passa tudo.
 * @param {import('../types.js').Task} task
 * @param {string} filter
 * @param {boolean} done
 * @param {string} [today] `YYYY-MM-DD` local (padrão: hoje)
 * @returns {boolean}
 */
export function matchesDueFilter(task, filter, done, today = todayLocal()) {
  switch (filter) {
    case 'atrasadas':
      return isTaskOverdue(task, done, today)
    case 'hoje':
      return task.dueDate === today
    case '7dias':
      return Boolean(task.dueDate) && task.dueDate >= today && task.dueDate <= addDaysLocal(today, 7)
    case 'sem-prazo':
      return !task.dueDate
    default:
      return true
  }
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
