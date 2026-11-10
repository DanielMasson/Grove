// Agregações puras dos Gráficos (spec 05). Sempre por data LOCAL, nunca por iso.slice(0, 10) (UTC).

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const pad = (n) => String(n).padStart(2, '0')

/** @param {Date} d */
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/** @param {Date} d */
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
/** Segunda-feira da semana de `d` (C1: semana começa na segunda). @param {Date} d */
const weekStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7))

/** Sessões válidas, com a data local já calculada. */
function valid(sessions) {
  const out = []
  for (const s of sessions) {
    if (!s || !Number.isFinite(s.minutes)) continue
    const d = new Date(s.completedAt)
    if (Number.isNaN(d.getTime())) continue
    out.push({ s, d })
  }
  return out
}

/**
 * @param {import('../../types.js').Session[]} sessions
 * @param {number} days quantos dias para trás, incluindo hoje
 * @param {Date} [today]
 * @returns {{ label: string, key: string, minutes: number }[]}
 */
export function minutesPerDay(sessions, days, today = new Date()) {
  const totals = new Map()
  for (const { s, d } of valid(sessions)) totals.set(dayKey(d), (totals.get(dayKey(d)) ?? 0) + s.minutes)
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = dayKey(d)
    out.push({ key, label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, minutes: totals.get(key) ?? 0 })
  }
  return out
}

/** Semanas começando na segunda; o rótulo é o dia da segunda-feira. */
export function minutesPerWeek(sessions, weeks, today = new Date()) {
  const totals = new Map()
  for (const { s, d } of valid(sessions)) {
    const k = dayKey(weekStart(d))
    totals.set(k, (totals.get(k) ?? 0) + s.minutes)
  }
  const current = weekStart(today)
  const out = []
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7 * i)
    const key = dayKey(d)
    out.push({ key, label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, minutes: totals.get(key) ?? 0 })
  }
  return out
}

export function minutesPerMonth(sessions, months, today = new Date()) {
  const totals = new Map()
  for (const { s, d } of valid(sessions)) totals.set(monthKey(d), (totals.get(monthKey(d)) ?? 0) + s.minutes)
  const out = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const key = monthKey(d)
    out.push({ key, label: `${MONTHS[d.getMonth()]}/${d.getFullYear()}`, minutes: totals.get(key) ?? 0 })
  }
  return out
}

/** @returns {{ id: string | undefined, label: string, minutes: number }[]} ordenado por minutos desc */
export function minutesByNotebook(sessions, notebooks) {
  const names = new Map(notebooks.map((n) => [n.id, n.name]))
  const totals = new Map()
  for (const { s } of valid(sessions)) {
    const id = s.notebookId && names.has(s.notebookId) ? s.notebookId : undefined
    totals.set(id, (totals.get(id) ?? 0) + s.minutes)
  }
  return [...totals]
    .map(([id, minutes]) => ({ id, label: id ? names.get(id) : 'Sem caderno', minutes }))
    .sort((a, b) => b.minutes - a.minutes)
}

/** Sessões sem tarefa ficam fora (C2). As tarefas além de `limit` viram "Outras". */
export function minutesByTask(sessions, tasks, limit = 10) {
  const names = new Map(tasks.map((t) => [t.id, t.title]))
  const totals = new Map()
  for (const { s } of valid(sessions)) {
    if (!s.taskId || !names.has(s.taskId)) continue
    totals.set(s.taskId, (totals.get(s.taskId) ?? 0) + s.minutes)
  }
  const sorted = [...totals]
    .map(([id, minutes]) => ({ id, label: names.get(id), minutes }))
    .sort((a, b) => b.minutes - a.minutes)
  if (sorted.length <= limit) return sorted
  const rest = sorted.slice(limit).reduce((sum, x) => sum + x.minutes, 0)
  return [...sorted.slice(0, limit), { id: undefined, label: 'Outras', minutes: rest }]
}

/** 85 -> "1 h 25 min"; 45 -> "45 min"; 120 -> "2 h" */
export function formatMinutes(minutes) {
  const m = Math.round(minutes)
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r} min`
  return r === 0 ? `${h} h` : `${h} h ${r} min`
}
