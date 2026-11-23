import { describe, expect, it } from 'vitest'
import { allTags, filterSources } from './sources'

const sources = [
  { id: '1', type: 'link', title: 'Khan Academy', url: 'https://pt.khanacademy.org/', tags: ['vídeo', 'funções'] },
  { id: '2', type: 'note', title: 'Fórmulas', text: 'Bhaskara', tags: ['prova', 'funções'] },
  { id: '3', type: 'youtube', title: 'Aula', url: 'https://youtu.be/dQw4w9WgXcQ', tags: [] },
]

describe('allTags', () => {
  it('junta tags únicas em ordem alfabética (pt-BR)', () => {
    expect(allTags(sources)).toEqual(['funções', 'prova', 'vídeo'])
  })

  it('aceita fonte sem tags', () => {
    expect(allTags([{ id: 'x', type: 'note', title: 't' }])).toEqual([])
  })
})

describe('filterSources', () => {
  it('sem busca e sem tags devolve tudo', () => {
    expect(filterSources(sources, '', [])).toHaveLength(3)
  })

  it('tags combinam com E: só quem tem TODAS as marcadas', () => {
    expect(filterSources(sources, '', ['funções']).map((s) => s.id)).toEqual(['1', '2'])
    expect(filterSources(sources, '', ['funções', 'prova']).map((s) => s.id)).toEqual(['2'])
    expect(filterSources(sources, '', ['funções', 'inexistente'])).toEqual([])
  })

  it('texto ignora acentos e maiúsculas e procura em título, URL, texto e tags', () => {
    expect(filterSources(sources, 'FORMULAS', []).map((s) => s.id)).toEqual(['2'])
    expect(filterSources(sources, 'khanacademy', []).map((s) => s.id)).toEqual(['1'])
    expect(filterSources(sources, 'bhaskara', []).map((s) => s.id)).toEqual(['2'])
    expect(filterSources(sources, 'video', []).map((s) => s.id)).toEqual(['1'])
  })

  it('busca e tags se combinam', () => {
    expect(filterSources(sources, 'khan', ['prova'])).toEqual([])
    expect(filterSources(sources, 'khan', ['vídeo']).map((s) => s.id)).toEqual(['1'])
  })
})
