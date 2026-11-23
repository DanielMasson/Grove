import { describe, expect, it } from 'vitest'
import { BIOMES, DEFAULT_BIOME, MAX_STAGES, stagesForMinutes } from './config'

describe('stagesForMinutes', () => {
  it.each([
    [15, 1],
    [30, 1],
    [31, 2],
    [45, 2],
    [60, 2],
    [75, 3],
    [90, 3],
    [120, 4],
  ])('%i min rendem %i estágio(s)', (minutes, stages) => {
    expect(stagesForMinutes(minutes)).toBe(stages)
  })

  it('nunca passa de MAX_STAGES nem fica abaixo de 1', () => {
    expect(stagesForMinutes(500)).toBe(MAX_STAGES)
    expect(stagesForMinutes(0)).toBe(1)
  })
})

describe('BIOMES', () => {
  it('o bioma padrão existe e todo bioma tem espécies', () => {
    expect(Object.keys(BIOMES)).toContain(DEFAULT_BIOME)
    for (const biome of Object.values(BIOMES)) {
      expect(biome.species.length).toBeGreaterThan(0)
    }
  })
})
