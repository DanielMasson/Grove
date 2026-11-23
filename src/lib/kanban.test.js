import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  addDaysLocal,
  formatDueDate,
  isDoneTask,
  isTaskOverdue,
  matchesDueFilter,
  todayLocal,
} from './kanban'

const task = (dueDate) => ({ id: 't', title: 'T', description: '', priority: 'media', columnId: 'todo', order: 0, dueDate })

afterEach(() => vi.useRealTimers())

describe('todayLocal', () => {
  it('usa a data local, não a UTC (23h30 ainda é o mesmo dia)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 23, 23, 30))
    expect(todayLocal()).toBe('2026-11-23')
  })

  it('00h10 do dia 1º continua no dia 1º', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 0, 10))
    expect(todayLocal()).toBe('2026-01-01')
  })
})

describe('formatDueDate', () => {
  it('converte YYYY-MM-DD para DD/MM/YYYY sem deslocar por fuso', () => {
    expect(formatDueDate('2026-11-20')).toBe('20/11/2026')
    expect(formatDueDate('2026-01-05')).toBe('05/01/2026')
  })
})

describe('isTaskOverdue', () => {
  it('prazo anterior a hoje e fora da coluna de conclusão está atrasado', () => {
    expect(isTaskOverdue(task('2026-11-22'), false, '2026-11-23')).toBe(true)
  })

  it('prazo de hoje ou futuro não está atrasado', () => {
    expect(isTaskOverdue(task('2026-11-23'), false, '2026-11-23')).toBe(false)
    expect(isTaskOverdue(task('2026-11-24'), false, '2026-11-23')).toBe(false)
  })

  it('sem prazo nunca está atrasado', () => {
    expect(isTaskOverdue(task(undefined), false, '2026-11-23')).toBe(false)
  })

  it('tarefa na coluna de conclusão nunca está atrasada', () => {
    expect(isTaskOverdue(task('2020-01-01'), true, '2026-11-23')).toBe(false)
  })
})

describe('isDoneTask', () => {
  const columns = [
    { id: 'todo', name: 'A fazer', order: 0, isDone: false },
    { id: 'done', name: 'Concluído', order: 1, isDone: true },
  ]
  it('depende só do isDone da coluna da tarefa', () => {
    expect(isDoneTask({ ...task(), columnId: 'done' }, columns)).toBe(true)
    expect(isDoneTask({ ...task(), columnId: 'todo' }, columns)).toBe(false)
    expect(isDoneTask({ ...task(), columnId: 'sumiu' }, columns)).toBe(false)
  })
})

describe('addDaysLocal', () => {
  it('atravessa fim de mês, de ano e ano bissexto', () => {
    expect(addDaysLocal('2026-11-28', 7)).toBe('2026-12-05')
    expect(addDaysLocal('2026-12-28', 7)).toBe('2027-01-04')
    expect(addDaysLocal('2024-02-28', 2)).toBe('2024-03-01')
    expect(addDaysLocal('2026-11-23', 0)).toBe('2026-11-23')
  })
})

describe('matchesDueFilter (hoje = 2026-11-23)', () => {
  const today = '2026-11-23'

  it('sem filtro passa tudo', () => {
    expect(matchesDueFilter(task('2020-01-01'), '', false, today)).toBe(true)
    expect(matchesDueFilter(task(undefined), '', false, today)).toBe(true)
  })

  it('atrasadas: só prazo vencido e fora da coluna de conclusão', () => {
    expect(matchesDueFilter(task('2026-11-22'), 'atrasadas', false, today)).toBe(true)
    expect(matchesDueFilter(task('2026-11-22'), 'atrasadas', true, today)).toBe(false)
    expect(matchesDueFilter(task('2026-11-23'), 'atrasadas', false, today)).toBe(false)
    expect(matchesDueFilter(task(undefined), 'atrasadas', false, today)).toBe(false)
  })

  it('hoje: só prazo igual a hoje', () => {
    expect(matchesDueFilter(task('2026-11-23'), 'hoje', false, today)).toBe(true)
    expect(matchesDueFilter(task('2026-11-24'), 'hoje', false, today)).toBe(false)
    expect(matchesDueFilter(task('2026-11-22'), 'hoje', false, today)).toBe(false)
  })

  it('7dias: de hoje até hoje + 7, inclusive', () => {
    expect(matchesDueFilter(task('2026-11-23'), '7dias', false, today)).toBe(true)
    expect(matchesDueFilter(task('2026-11-30'), '7dias', false, today)).toBe(true)
    expect(matchesDueFilter(task('2026-12-01'), '7dias', false, today)).toBe(false)
    expect(matchesDueFilter(task('2026-11-22'), '7dias', false, today)).toBe(false)
    expect(matchesDueFilter(task(undefined), '7dias', false, today)).toBe(false)
  })

  it('sem-prazo: só tarefas sem dueDate', () => {
    expect(matchesDueFilter(task(undefined), 'sem-prazo', false, today)).toBe(true)
    expect(matchesDueFilter(task('2026-11-23'), 'sem-prazo', false, today)).toBe(false)
  })
})
