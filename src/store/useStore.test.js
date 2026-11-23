// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from './useStore'

const st = () => useStore.getState()

const newTask = (title, columnId = 'todo', extra = {}) =>
  st().addTask({ title, description: '', priority: 'media', columnId, order: 0, ...extra })

const orderOf = (columnId) =>
  st()
    .tasks.filter((t) => t.columnId === columnId)
    .sort((a, b) => a.order - b.order)
    .map((t) => t.title)

beforeEach(() => {
  localStorage.clear()
  st().resetData()
})

describe('completeSession', () => {
  const base = { biome: 'planicie', species: 'carvalho' }

  it('planta árvore nova com os estágios da sessão e grava a Session', () => {
    const r = st().completeSession({ ...base, minutes: 45 })
    expect(r.isNewTree).toBe(true)
    expect(r.finalStage).toBe(2)
    expect(r.stagesGained).toBe(2)
    expect(st().trees).toHaveLength(1)
    expect(st().sessions).toHaveLength(1)
    expect(st().sessions[0]).toMatchObject({ minutes: 45, treeId: r.treeId, stagesGained: 2 })
  })

  it('evolui a árvore existente, mantendo espécie e bioma dela', () => {
    const first = st().completeSession({ ...base, minutes: 25 }) // estágio 1
    const r = st().completeSession({ biome: 'savana', species: 'acacia', minutes: 45, treeId: first.treeId })
    expect(r.isNewTree).toBe(false)
    expect(r.finalStage).toBe(3)
    expect(r.stagesGained).toBe(2)
    expect(st().trees).toHaveLength(1)
    expect(st().trees[0]).toMatchObject({ biome: 'planicie', species: 'carvalho', stages: 3 })
  })

  it('respeita o teto do estágio 4', () => {
    const first = st().completeSession({ ...base, minutes: 75 }) // estágio 3
    const r = st().completeSession({ ...base, minutes: 120, treeId: first.treeId })
    expect(r.finalStage).toBe(4)
    expect(r.stagesGained).toBe(1)

    const again = st().completeSession({ ...base, minutes: 30, treeId: first.treeId })
    expect(again.finalStage).toBe(4)
    expect(again.stagesGained).toBe(0)
    expect(st().sessions).toHaveLength(3) // a sessão é registrada mesmo sem ganho
  })

  it('a tarefa define o caderno da sessão e da árvore', () => {
    const nb = st().addNotebook({ name: 'Matemática', biome: 'montanha' })
    const taskId = newTask('Lista', 'todo', { notebookId: nb })
    st().completeSession({ biome: 'montanha', species: 'pinheiro', minutes: 25, taskId })
    expect(st().sessions[0]).toMatchObject({ taskId, notebookId: nb })
    expect(st().trees[0].notebookId).toBe(nb)
  })

  it('tarefa e caderno excluídos no meio da sessão são descartados, sem quebrar', () => {
    const r = st().completeSession({ ...base, minutes: 25, taskId: 'sumiu', notebookId: 'sumiu' })
    expect(r.isNewTree).toBe(true)
    expect(st().sessions[0].taskId).toBeUndefined()
    expect(st().sessions[0].notebookId).toBeUndefined()
    expect(st().trees[0].notebookId).toBeUndefined()
  })

  it('usa o completedAt informado se for válido e passado; ignora se for futuro', () => {
    st().completeSession({ ...base, minutes: 25, completedAt: '2026-01-01T10:00:00.000Z' })
    expect(st().sessions[0].completedAt).toBe('2026-01-01T10:00:00.000Z')

    const future = new Date(Date.now() + 3_600_000).toISOString()
    st().completeSession({ ...base, minutes: 25, completedAt: future })
    expect(Date.parse(st().sessions[1].completedAt)).toBeLessThanOrEqual(Date.now())
  })
})

describe('moveTask', () => {
  it('reindexa a ordem dentro da mesma coluna', () => {
    const [, , c] = [newTask('A'), newTask('B'), newTask('C')]
    expect(orderOf('todo')).toEqual(['A', 'B', 'C'])
    st().moveTask(c, 'todo', 0)
    expect(orderOf('todo')).toEqual(['C', 'A', 'B'])
    expect(st().tasks.map((t) => t.order).sort()).toEqual([0, 1, 2])
  })

  it('entre colunas: reindexa origem e destino', () => {
    const a = newTask('A')
    newTask('B')
    newTask('X', 'doing')
    st().moveTask(a, 'doing', 0)
    expect(orderOf('todo')).toEqual(['B'])
    expect(orderOf('doing')).toEqual(['A', 'X'])
    expect(st().tasks.find((t) => t.id === a).columnId).toBe('doing')
  })

  it('índice fora do intervalo vira "no fim"; coluna inexistente não faz nada', () => {
    const a = newTask('A')
    newTask('X', 'doing')
    st().moveTask(a, 'doing', 99)
    expect(orderOf('doing')).toEqual(['X', 'A'])
    const before = JSON.stringify(st().tasks)
    st().moveTask(a, 'nao-existe', 0)
    expect(JSON.stringify(st().tasks)).toBe(before)
  })
})

describe('removeNotebook', () => {
  it('apaga o caderno e as tarefas dele; sessões e árvores ficam sem vínculo', () => {
    const nb = st().addNotebook({ name: 'Mat', biome: 'montanha' })
    const taskId = newTask('Lista', 'todo', { notebookId: nb })
    newTask('Outra') // sem caderno: permanece
    st().completeSession({ biome: 'montanha', species: 'pinheiro', minutes: 25, taskId })

    st().removeNotebook(nb)

    expect(st().notebooks).toHaveLength(0)
    expect(st().tasks.map((t) => t.title)).toEqual(['Outra'])
    expect(st().sessions).toHaveLength(1)
    expect(st().sessions[0].notebookId).toBeUndefined()
    expect(st().sessions[0].taskId).toBeUndefined()
    expect(st().trees[0].notebookId).toBeUndefined()
  })
})

describe('removeColumn', () => {
  it('apaga as tarefas da coluna e limpa o vínculo das sessões', () => {
    const taskId = newTask('A', 'doing')
    newTask('B', 'todo')
    st().completeSession({ biome: 'planicie', species: 'carvalho', minutes: 25, taskId })

    st().removeColumn('doing')

    expect(st().columns.map((c) => c.id)).toEqual(['todo', 'done'])
    expect(st().tasks.map((t) => t.title)).toEqual(['B'])
    expect(st().sessions[0].taskId).toBeUndefined()
  })

  it('nunca remove a última coluna', () => {
    st().removeColumn('todo')
    st().removeColumn('doing')
    st().removeColumn('done')
    expect(st().columns).toHaveLength(1)
    expect(st().columns[0].id).toBe('done')
  })
})

describe('importData / exportData', () => {
  it('rejeita JSON inválido', () => {
    expect(() => st().importData('{ isso não é json')).toThrow('O arquivo não é um JSON válido.')
  })

  it('rejeita schemaVersion errado ou ausente', () => {
    expect(() => st().importData(JSON.stringify({ schemaVersion: 2 }))).toThrow(
      'Arquivo de backup inválido ou de outra versão.',
    )
    expect(() => st().importData(JSON.stringify({ notebooks: [] }))).toThrow(
      'Arquivo de backup inválido ou de outra versão.',
    )
  })

  it('exporta e reimporta sem perder dados', () => {
    const nb = st().addNotebook({ name: 'Mat', biome: 'montanha' })
    newTask('Lista', 'todo', { notebookId: nb })
    st().completeSession({ biome: 'montanha', species: 'pinheiro', minutes: 45 })
    const json = st().exportData()

    st().resetData()
    expect(st().sessions).toHaveLength(0)

    st().importData(json)
    expect(st().notebooks).toHaveLength(1)
    expect(st().tasks).toHaveLength(1)
    expect(st().sessions).toHaveLength(1)
    expect(st().trees).toHaveLength(1)
  })

  it('descarta itens inválidos em vez de quebrar (espécie inexistente, estágios fora da faixa)', () => {
    st().importData(
      JSON.stringify({
        schemaVersion: 1,
        trees: [
          { id: 'ok', biome: 'planicie', species: 'carvalho', stages: 99, plantedAt: '2026-10-20T13:00:00.000Z' },
          { id: 'ruim', biome: 'planicie', species: 'nao-existe', stages: 1, plantedAt: '2026-10-20T13:00:00.000Z' },
        ],
      }),
    )
    expect(st().trees.map((t) => t.id)).toEqual(['ok'])
    expect(st().trees[0].stages).toBe(4)
    // sem colunas no arquivo: volta ao padrão
    expect(st().columns.length).toBeGreaterThan(0)
  })

  it('backup antigo sem settings cai no padrão', () => {
    st().importData(JSON.stringify({ schemaVersion: 1 }))
    expect(st().settings).toEqual({
      theme: 'system',
      dailyGoalMinutes: null,
      notifyOnComplete: false,
      soundOnComplete: false,
    })
  })
})
