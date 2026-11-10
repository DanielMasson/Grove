import { normalize } from './search'

/**
 * Tags únicas das fontes, em ordem alfabética.
 * @param {import('../types.js').Source[]} sources
 * @returns {string[]}
 */
export function allTags(sources) {
  return [...new Set(sources.flatMap((s) => s.tags ?? []))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

/**
 * Filtra fontes por texto (título, URL, texto, tags) e por tags: mostra as que têm
 * TODAS as tags marcadas (C3: E).
 * @param {import('../types.js').Source[]} sources
 * @param {string} query
 * @param {string[]} selectedTags
 * @returns {import('../types.js').Source[]}
 */
export function filterSources(sources, query, selectedTags) {
  const q = normalize(query)
  return sources.filter((s) => {
    if (!selectedTags.every((t) => (s.tags ?? []).includes(t))) return false
    if (!q) return true
    return (
      normalize(s.title).includes(q) ||
      (s.url && normalize(s.url).includes(q)) ||
      (s.text && normalize(s.text).includes(q)) ||
      (s.tags ?? []).some((t) => normalize(t).includes(q))
    )
  })
}
