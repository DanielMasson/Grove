const ID_RE = /^[A-Za-z0-9_-]{11}$/

/**
 * Extrai o ID de um vídeo do YouTube. Aceita watch?v=, youtu.be/, shorts/, embed/ e live/,
 * com ou sem www./m., ignorando parâmetros extras. Retorna null se não reconhecer.
 * @param {string} input
 * @returns {string | null}
 */
export function parseYouTubeId(input) {
  if (typeof input !== 'string') return null
  const raw = input.trim()
  if (!raw) return null
  let u
  try {
    u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  const host = u.hostname.toLowerCase().replace(/^(www\.|m\.)/, '')
  let id = null
  if (host === 'youtu.be') {
    id = u.pathname.split('/')[1]
  } else if (host === 'youtube.com') {
    const [, first, second] = u.pathname.split('/')
    if (first === 'watch') id = u.searchParams.get('v')
    else if (['shorts', 'embed', 'live'].includes(first)) id = second
  }
  return id && ID_RE.test(id) ? id : null
}
