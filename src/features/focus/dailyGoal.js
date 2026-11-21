// Meta diária (F03). Funções puras: sempre por data LOCAL, nunca por toISOString().slice(0, 10) (UTC).

export const GOAL_MIN = 15
export const GOAL_MAX = 600
export const GOAL_STEP = 5

/**
 * Minutos de foco concluídos no dia local de `now`.
 * @param {import('../../types.js').Session[]} sessions
 * @param {Date} [now]
 * @returns {number}
 */
export function minutesToday(sessions, now = new Date()) {
  const y = now.getFullYear()
  const m = now.getMonth()
  const day = now.getDate()
  let total = 0
  for (const s of sessions) {
    if (!s || !Number.isFinite(s.minutes)) continue
    const d = new Date(s.completedAt)
    if (Number.isNaN(d.getTime())) continue
    if (d.getFullYear() === y && d.getMonth() === m && d.getDate() === day) total += s.minutes
  }
  return total
}

/**
 * Valida o texto do campo "Meta de hoje". Vazio = sem meta.
 * @param {string} text
 * @returns {{ value: number | null, error?: string }}
 */
export function parseGoal(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return { value: null }
  const n = Number(raw)
  if (!/^\d+$/.test(raw) || n < GOAL_MIN || n > GOAL_MAX || n % GOAL_STEP !== 0) {
    return {
      value: null,
      error: `Informe um número entre ${GOAL_MIN} e ${GOAL_MAX}, de ${GOAL_STEP} em ${GOAL_STEP} minutos.`,
    }
  }
  return { value: n }
}
