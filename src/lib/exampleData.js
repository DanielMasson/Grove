import { MAX_STAGES, stagesForMinutes } from '../biomes/config'

/**
 * Dados de exemplo com datas RELATIVAS a hoje (sessões nos últimos 14 dias), para os gráficos
 * por dia aparecerem preenchidos. Mesma estrutura de `src/seed.example.json`.
 * Passe o resultado por `importData` (JSON.stringify) para validar e gravar.
 * @param {Date} [now]
 * @returns {import('../types.js').AppData}
 */
export function buildExampleData(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  /** Data local `YYYY-MM-DD`, `offset` dias a partir de hoje. */
  const dayStr = (offset) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }
  /** Horário local `hour`h de `daysAgo` dias atrás; nunca no futuro. */
  const at = (daysAgo, hour) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, 0, 0)
    return d.getTime() > now.getTime() ? new Date(now.getTime() - 30 * 60_000) : d
  }

  const createdAt = at(14, 9).toISOString()

  const notebooks = [
    {
      id: 'ex-mat', name: 'Matemática', biome: 'montanha', createdAt,
      sources: [
        { id: 'ex-mat-s1', type: 'link', title: 'Khan Academy: funções', url: 'https://pt.khanacademy.org/', tags: ['funções', 'vídeo-aula'] },
        { id: 'ex-mat-s2', type: 'note', title: 'Fórmulas para a prova', text: 'Bhaskara: x = (-b ± √Δ) / 2a, com Δ = b² - 4ac.', tags: ['prova'] },
      ],
    },
    { id: 'ex-por', name: 'Português', biome: 'planicie', createdAt, sources: [] },
    {
      id: 'ex-his', name: 'História', biome: 'floresta', createdAt,
      sources: [{ id: 'ex-his-s1', type: 'note', title: 'Linha do tempo', text: 'Revolução Francesa: 1789.', tags: ['resumo'] }],
    },
    { id: 'ex-bio', name: 'Biologia', biome: 'savana', createdAt, sources: [] },
  ]

  const columns = [
    { id: 'todo', name: 'A fazer', order: 0, isDone: false },
    { id: 'doing', name: 'Em andamento', order: 1, isDone: false },
    { id: 'done', name: 'Concluído', order: 2, isDone: true },
  ]

  const tasks = [
    { id: 'ex-t1', title: 'Lista de funções', description: 'Exercícios 1 a 20.', dueDate: dayStr(-2), priority: 'alta', columnId: 'todo', notebookId: 'ex-mat', order: 0 },
    { id: 'ex-t2', title: 'Resumo de Machado de Assis', description: '', dueDate: dayStr(3), priority: 'media', columnId: 'doing', notebookId: 'ex-por', order: 0 },
    { id: 'ex-t3', title: 'Seminário sobre a Revolução Francesa', description: 'Slides e roteiro.', dueDate: dayStr(7), priority: 'alta', columnId: 'doing', notebookId: 'ex-his', order: 1 },
    { id: 'ex-t4', title: 'Relatório de ecossistemas', description: '', priority: 'baixa', columnId: 'todo', notebookId: 'ex-bio', order: 1 },
    { id: 'ex-t5', title: 'Revisar acentuação', description: '', priority: 'baixa', columnId: 'done', notebookId: 'ex-por', order: 0 },
  ]

  // Cada árvore recebe as sessões abaixo, em ordem cronológica.
  const treeDefs = {
    pin: { biome: 'montanha', species: 'pinheiro', notebookId: 'ex-mat' },
    abe: { biome: 'montanha', species: 'abeto', notebookId: 'ex-mat' },
    car: { biome: 'planicie', species: 'carvalho', notebookId: 'ex-por' },
    ipe: { biome: 'planicie', species: 'ipe', notebookId: 'ex-por' },
    jeq: { biome: 'floresta', species: 'jequitiba', notebookId: 'ex-his' },
    bao: { biome: 'savana', species: 'baobá', notebookId: 'ex-bio' },
    aca: { biome: 'savana', species: 'acacia', notebookId: 'ex-bio' },
  }

  // [dias atrás, hora, minutos, árvore, tarefa?]
  const plan = [
    [13, 9, 25, 'pin', 'ex-t1'], [12, 14, 30, 'car'], [11, 20, 50, 'jeq', 'ex-t3'],
    [10, 9, 45, 'pin', 'ex-t1'], [9, 16, 90, 'bao'], [8, 14, 45, 'car', 'ex-t2'],
    [7, 16, 25, 'bao'], [6, 18, 25, 'pin'], [5, 20, 30, 'jeq', 'ex-t3'],
    [4, 19, 25, 'jeq'], [3, 10, 60, 'abe', 'ex-t1'], [2, 15, 25, 'car', 'ex-t2'],
    [1, 10, 45, 'abe'], [1, 16, 40, 'aca', 'ex-t4'], [0, 8, 25, 'ipe', 'ex-t2'], [0, 11, 15, 'aca'],
  ]
    .map(([daysAgo, hour, minutes, treeKey, taskId]) => ({ when: at(daysAgo, hour), minutes, treeKey, taskId }))
    .sort((a, b) => a.when - b.when)

  const treesByKey = {}
  const sessions = plan.map((p, i) => {
    const def = treeDefs[p.treeKey]
    let tree = treesByKey[p.treeKey]
    if (!tree) {
      tree = { id: `ex-tr-${p.treeKey}`, ...def, stages: 0, plantedAt: p.when.toISOString() }
      treesByKey[p.treeKey] = tree
    }
    const before = tree.stages
    tree.stages = Math.min(MAX_STAGES, before + stagesForMinutes(p.minutes))
    const session = {
      id: `ex-s${i + 1}`,
      completedAt: p.when.toISOString(),
      minutes: p.minutes,
      notebookId: def.notebookId,
      biome: def.biome,
      species: def.species,
      treeId: tree.id,
      stagesGained: tree.stages - before,
    }
    if (p.taskId) session.taskId = p.taskId
    return session
  })

  return { schemaVersion: 1, notebooks, columns, tasks, sessions, trees: Object.values(treesByKey) }
}
