import { describe, expect, it } from 'vitest'
import { normalize, searchNotebooks } from './search'

describe('normalize', () => {
  it('remove acentos e ignora maiúsculas', () => {
    expect(normalize('Matemática')).toBe('matematica')
    expect(normalize('AÇÃO')).toBe('acao')
  })

  it('aceita undefined/null sem lançar', () => {
    expect(normalize(undefined)).toBe('')
    expect(normalize(null)).toBe('')
  })
})

describe('searchNotebooks', () => {
  const notebooks = [
    {
      id: 'mat', name: 'Matemática', biome: 'montanha', createdAt: '', sources: [
        { id: 's1', type: 'link', title: 'Khan Academy', url: 'https://pt.khanacademy.org/', tags: ['funções'] },
        { id: 's2', type: 'note', title: 'Fórmulas', text: 'Bhaskara resolve equações', tags: [] },
      ],
    },
    { id: 'por', name: 'Português', biome: 'planicie', createdAt: '', sources: [] },
  ]

  it('busca vazia devolve todos, sem fonte destacada', () => {
    const r = searchNotebooks(notebooks, '  ')
    expect(r).toHaveLength(2)
    expect(r.every((x) => x.matchedSource === null)).toBe(true)
  })

  it('acha pelo nome sem acento e sem diferenciar caixa', () => {
    const r = searchNotebooks(notebooks, 'MATEMATICA')
    expect(r).toHaveLength(1)
    expect(r[0].notebook.id).toBe('mat')
    expect(r[0].matchedSource).toBeNull()
  })

  it('acha pelo título, URL, texto e tag da fonte e aponta a fonte', () => {
    expect(searchNotebooks(notebooks, 'khan')[0].matchedSource.id).toBe('s1')
    expect(searchNotebooks(notebooks, 'khanacademy.org')[0].matchedSource.id).toBe('s1')
    expect(searchNotebooks(notebooks, 'equacoes')[0].matchedSource.id).toBe('s2')
    expect(searchNotebooks(notebooks, 'funcoes')[0].matchedSource.id).toBe('s1')
  })

  it('ignora espaços nas pontas da busca', () => {
    expect(searchNotebooks(notebooks, '  matematica ')).toHaveLength(1)
  })

  it('sem resultado devolve lista vazia', () => {
    expect(searchNotebooks(notebooks, 'xyz')).toEqual([])
  })
})
