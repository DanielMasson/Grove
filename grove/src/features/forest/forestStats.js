import { BIOMES, MAX_STAGES } from '../../biomes/config'

/**
 * Resumo por bioma. Os quatro biomas sempre aparecem, mesmo zerados.
 * @param {import('../../types.js').Tree[]} trees
 * @param {import('../../types.js').Session[]} sessions
 * @returns {Record<import('../../types.js').BiomeId, { trees: number, adults: number, minutes: number }>}
 */
export function summarizeByBiome(trees, sessions) {
  /** @type {Record<string, { trees: number, adults: number, minutes: number }>} */
  const out = {}
  for (const id of Object.keys(BIOMES)) out[id] = { trees: 0, adults: 0, minutes: 0 }
  for (const t of trees) {
    const b = out[t.biome]
    if (!b) continue
    b.trees += 1
    if (t.stages >= MAX_STAGES) b.adults += 1
  }
  for (const s of sessions) {
    const b = out[s.biome]
    if (b && Number.isFinite(s.minutes)) b.minutes += s.minutes
  }
  return out
}

/**
 * Árvores de um bioma, da mais recente para a mais antiga.
 * @param {import('../../types.js').Tree[]} trees
 * @param {import('../../types.js').BiomeId} biomeId
 * @returns {import('../../types.js').Tree[]}
 */
export function treesOfBiome(trees, biomeId) {
  const time = (t) => {
    const n = Date.parse(t.plantedAt)
    return Number.isFinite(n) ? n : 0
  }
  return trees.filter((t) => t.biome === biomeId).sort((a, b) => time(b) - time(a))
}
