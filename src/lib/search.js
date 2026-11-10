// Busca de texto (RF20): ignora acentos e maiúsculas.

/**
 * Normaliza um texto para comparação: remove acentos e caixa.
 * @param {string} text
 * @returns {string}
 */
export function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/**
 * Procura `query` nos cadernos: nome, título/URL/texto das fontes e tags.
 * @param {import('../types.js').Notebook[]} notebooks
 * @param {string} query
 * @returns {{ notebook: import('../types.js').Notebook, matchedSource: import('../types.js').Source | null }[]}
 *   cadernos que casam com a busca; `matchedSource` aponta a fonte encontrada (null se casou pelo nome).
 */
export function searchNotebooks(notebooks, query) {
  const q = normalize(query)
  if (!q) return notebooks.map((notebook) => ({ notebook, matchedSource: null }))

  const results = []
  for (const notebook of notebooks) {
    if (normalize(notebook.name).includes(q)) {
      results.push({ notebook, matchedSource: null })
      continue
    }
    const matchedSource = (notebook.sources ?? []).find(
      (s) =>
        normalize(s.title).includes(q) ||
        (s.url && normalize(s.url).includes(q)) ||
        (s.text && normalize(s.text).includes(q)) ||
        (s.tags ?? []).some((t) => normalize(t).includes(q)),
    )
    if (matchedSource) results.push({ notebook, matchedSource })
  }
  return results
}
