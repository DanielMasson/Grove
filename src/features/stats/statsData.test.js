import { describe, expect, it } from 'vitest'
import {
  bestStreak,
  currentStreak,
  formatMinutes,
  minutesByBiome,
  minutesByNotebook,
  minutesByTask,
  minutesPerDay,
  minutesPerMonth,
  minutesPerWeek,
} from './statsData'

/** Sessão em horário LOCAL (ano, mês 1-12, dia, hora, minuto). */
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).toISOString()
const session = (completedAt, minutes, extra = {}) => ({
  id: `${completedAt}-${minutes}`,
  completedAt,
  minutes,
  biome: 'planicie',
  species: 'carvalho',
  ...extra,
})

describe('minutesPerDay', () => {
  const today = new Date(2026, 10, 23, 12) // 23/11/2026

  it('devolve os últimos N dias, incluindo hoje, com zeros', () => {
    const rows = minutesPerDay([session(at(2026, 11, 22), 25)], 3, today)
    expect(rows.map((r) => r.label)).toEqual(['21/11', '22/11', '23/11'])
    expect(rows.map((r) => r.minutes)).toEqual([0, 25, 0])
  })

  it('agrupa pela data LOCAL: 23h30 conta no próprio dia, não no dia seguinte (UTC)', () => {
    const rows = minutesPerDay([session(at(2026, 11, 22, 23, 30), 40)], 2, today)
    expect(rows.map((r) => r.minutes)).toEqual([40, 0])
  })

  it('soma sessões do mesmo dia e ignora sessões inválidas', () => {
    const rows = minutesPerDay(
      [
        session(at(2026, 11, 23, 8), 25),
        session(at(2026, 11, 23, 18), 30),
        session('data-invalida', 99),
        { ...session(at(2026, 11, 23), 1), minutes: NaN },
        null,
      ],
      1,
      today,
    )
    expect(rows[0].minutes).toBe(55)
  })
})

describe('minutesPerWeek', () => {
  it('a semana começa na segunda: domingo fica na semana anterior', () => {
    const today = new Date(2026, 10, 25, 12) // quarta, 25/11/2026
    const rows = minutesPerWeek(
      [session(at(2026, 11, 22), 10) /* domingo */, session(at(2026, 11, 23), 20) /* segunda */],
      2,
      today,
    )
    expect(rows.map((r) => r.label)).toEqual(['16/11', '23/11'])
    expect(rows.map((r) => r.minutes)).toEqual([10, 20])
  })
})

describe('minutesPerMonth', () => {
  it('rotula mês/ano e atravessa a virada do ano', () => {
    const today = new Date(2027, 0, 15, 12)
    const rows = minutesPerMonth([session(at(2026, 12, 31, 23, 50), 60), session(at(2027, 1, 2), 15)], 3, today)
    expect(rows.map((r) => r.label)).toEqual(['nov/2026', 'dez/2026', 'jan/2027'])
    expect(rows.map((r) => r.minutes)).toEqual([0, 60, 15])
  })
})

describe('minutesByNotebook', () => {
  const notebooks = [
    { id: 'a', name: 'Matemática' },
    { id: 'b', name: 'Português' },
  ]

  it('ordena por minutos (desc) e agrupa sessões sem caderno ou com caderno apagado', () => {
    const rows = minutesByNotebook(
      [
        session(at(2026, 11, 1), 25, { notebookId: 'a' }),
        session(at(2026, 11, 2), 60, { notebookId: 'b' }),
        session(at(2026, 11, 3), 10),
        session(at(2026, 11, 4), 5, { notebookId: 'apagado' }),
      ],
      notebooks,
    )
    expect(rows.map((r) => [r.label, r.minutes])).toEqual([
      ['Português', 60],
      ['Matemática', 25],
      ['Sem caderno', 15],
    ])
  })
})

describe('minutesByTask', () => {
  const tasks = [
    { id: 't1', title: 'A' },
    { id: 't2', title: 'B' },
    { id: 't3', title: 'C' },
  ]
  const sessions = [
    session(at(2026, 11, 1), 50, { taskId: 't1' }),
    session(at(2026, 11, 2), 30, { taskId: 't2' }),
    session(at(2026, 11, 3), 10, { taskId: 't3' }),
    session(at(2026, 11, 4), 99), // sem tarefa: fica fora
    session(at(2026, 11, 5), 99, { taskId: 'apagada' }), // tarefa inexistente: fora
  ]

  it('ignora sessões sem tarefa', () => {
    const rows = minutesByTask(sessions, tasks, 10)
    expect(rows.map((r) => r.label)).toEqual(['A', 'B', 'C'])
  })

  it('o que passa do limite vira "Outras"', () => {
    const rows = minutesByTask(sessions, tasks, 2)
    expect(rows.map((r) => [r.label, r.minutes])).toEqual([
      ['A', 50],
      ['B', 30],
      ['Outras', 10],
    ])
  })
})

describe('minutesByBiome', () => {
  it('sempre devolve os 4 biomas, em ordem decrescente de minutos', () => {
    const rows = minutesByBiome([
      session(at(2026, 11, 1), 25, { biome: 'montanha' }),
      session(at(2026, 11, 2), 60, { biome: 'savana' }),
      session(at(2026, 11, 3), 10, { biome: 'montanha' }),
    ])
    expect(rows).toHaveLength(4)
    expect(rows.map((r) => [r.id, r.minutes])).toEqual([
      ['savana', 60],
      ['montanha', 35],
      ['planicie', 0],
      ['floresta', 0],
    ])
    expect(rows[0].label).toBe('Savana')
  })

  it('sem sessões, todos zerados', () => {
    expect(minutesByBiome([]).every((r) => r.minutes === 0)).toBe(true)
  })
})

describe('currentStreak / bestStreak', () => {
  const today = new Date(2026, 10, 23, 15) // 23/11/2026

  it('sem sessões: 0 e 0', () => {
    expect(currentStreak([], today)).toBe(0)
    expect(bestStreak([])).toBe(0)
  })

  it('só hoje: 1', () => {
    const s = [session(at(2026, 11, 23, 9), 25)]
    expect(currentStreak(s, today)).toBe(1)
    expect(bestStreak(s)).toBe(1)
  })

  it('ontem e hoje: 2', () => {
    const s = [session(at(2026, 11, 22), 25), session(at(2026, 11, 23), 25)]
    expect(currentStreak(s, today)).toBe(2)
    expect(bestStreak(s)).toBe(2)
  })

  it('hoje sem sessão NÃO quebra a sequência se ontem teve', () => {
    const s = [session(at(2026, 11, 21), 25), session(at(2026, 11, 22), 25)]
    expect(currentStreak(s, today)).toBe(2)
  })

  it('anteontem sem ontem nem hoje: a sequência atual é 0, mas a melhor permanece', () => {
    const s = [session(at(2026, 11, 20), 25), session(at(2026, 11, 21), 25)]
    expect(currentStreak(s, today)).toBe(0)
    expect(bestStreak(s)).toBe(2)
  })

  it('buraco no meio: a atual conta só até o buraco; a melhor pega a maior corrida', () => {
    const s = [
      session(at(2026, 11, 15), 25),
      session(at(2026, 11, 16), 25),
      session(at(2026, 11, 17), 25),
      // 18, 19, 20 sem foco
      session(at(2026, 11, 21), 25),
      session(at(2026, 11, 22), 25),
      session(at(2026, 11, 23), 25),
    ]
    expect(currentStreak(s, today)).toBe(3)
    expect(bestStreak(s)).toBe(3)
    // Preenchendo o dia 18, a corrida 15..18 (4 dias) passa a ser a maior.
    expect(bestStreak([...s, session(at(2026, 11, 18), 25)])).toBe(4)
  })

  it('várias sessões no mesmo dia contam como um dia só', () => {
    const s = [session(at(2026, 11, 23, 8), 25), session(at(2026, 11, 23, 20), 25)]
    expect(currentStreak(s, today)).toBe(1)
    expect(bestStreak(s)).toBe(1)
  })

  it('virada de dia: 23h50 de um dia e 00h10 do seguinte são dias consecutivos', () => {
    const s = [session(at(2026, 11, 22, 23, 50), 25), session(at(2026, 11, 23, 0, 10), 25)]
    expect(currentStreak(s, today)).toBe(2)
  })

  it('virada de dia: sessão às 23h59 de ontem conta como "ontem" quando já passou da meia-noite', () => {
    const s = [session(at(2026, 11, 22, 23, 59), 25)]
    expect(currentStreak(s, new Date(2026, 10, 23, 0, 1))).toBe(1)
  })

  it('atravessa mês e ano', () => {
    const s = [session(at(2026, 12, 30), 25), session(at(2026, 12, 31), 25), session(at(2027, 1, 1), 25)]
    expect(currentStreak(s, new Date(2027, 0, 1, 12))).toBe(3)
    expect(bestStreak(s)).toBe(3)
  })

  it('ignora sessões inválidas', () => {
    const s = [session('data-invalida', 25), { ...session(at(2026, 11, 23), 1), minutes: NaN }]
    expect(currentStreak(s, today)).toBe(0)
  })
})

describe('formatMinutes', () => {
  it('formata minutos e horas', () => {
    expect(formatMinutes(85)).toBe('1 h 25 min')
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(120)).toBe('2 h')
    expect(formatMinutes(0)).toBe('0 min')
    expect(formatMinutes(59.6)).toBe('1 h')
  })
})
