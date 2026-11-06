/** Aceita só http/https. Adiciona https:// se faltar. Retorna null se inválida. */
export function safeHttpUrl(input) {
  if (typeof input !== 'string') return null
  const raw = input.trim()
  if (!raw) return null
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`
  try {
    const u = new URL(candidate)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}
