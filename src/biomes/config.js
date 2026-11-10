export const GROWTH_STAGES = ['broto', 'muda', 'jovem', 'adulta']

export const MAX_STAGES = GROWTH_STAGES.length // 4

// Sessão sem caderno usa a planície (bioma neutro).
/** @type {import('../types.js').BiomeId} */
export const DEFAULT_BIOME = 'planicie'

// Cada 30 min de foco rendem 1 estágio, arredondando para cima: 15=1, 45=2, 75=3, 120=4.
export const stagesForMinutes = (minutes) => Math.min(MAX_STAGES, Math.max(1, Math.ceil(minutes / 30)))

/**
 * @typedef {Object} Species
 * @property {string} id
 * @property {string} name
 * @property {string} emoji placeholder até existirem os SVGs
 */

/**
 * @typedef {Object} Biome
 * @property {import('../types.js').BiomeId} id
 * @property {string} name
 * @property {{ sky: string, ground: string }} colors
 * @property {Species[]} species
 */

// Estágios de crescimento: a árvore passa por eles durante a sessão (ex.: broto, muda, jovem, adulta).
/** @type {Record<import('../types.js').BiomeId, Biome>} */
export const BIOMES = {
  planicie: {
    id: 'planicie', name: 'Planície',
    colors: { sky: '#dff1ff', ground: '#b9e0a5' },
    species: [
      { id: 'carvalho', name: 'Carvalho', emoji: '🌳' },
      { id: 'ipe', name: 'Ipê', emoji: '🌼' },
    ],
  },
  montanha: {
    id: 'montanha', name: 'Montanha',
    colors: { sky: '#e6eef7', ground: '#c9d6cf' },
    species: [
      { id: 'pinheiro', name: 'Pinheiro', emoji: '🌲' },
      { id: 'abeto', name: 'Abeto', emoji: '🎄' },
    ],
  },
  floresta: {
    id: 'floresta', name: 'Floresta',
    colors: { sky: '#d6f0e0', ground: '#8fcf9a' },
    species: [
      { id: 'jequitiba', name: 'Jequitibá', emoji: '🌳' },
      { id: 'samambaia', name: 'Samambaia gigante', emoji: '🌿' },
    ],
  },
  savana: {
    id: 'savana', name: 'Savana',
    colors: { sky: '#fff1d6', ground: '#e6d199' },
    species: [
      { id: 'baobá', name: 'Baobá', emoji: '🌴' },
      { id: 'acacia', name: 'Acácia', emoji: '🌾' },
    ],
  },
}
