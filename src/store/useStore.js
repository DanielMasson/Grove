import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BIOMES, MAX_STAGES, stagesForMinutes } from '../biomes/config'
import { safeHttpUrl } from '../lib/url'

// ÚNICO lugar que fala com o localStorage (via middleware persist).
// As telas só usam este hook. Nunca leiam/escrevam localStorage direto.

export const uid = () => crypto.randomUUID()

/**
 * @typedef {Object} CompleteSessionInput
 * @property {number} minutes
 * @property {string} [taskId]
 * @property {string} [notebookId]
 * @property {import('../types.js').BiomeId} biome
 * @property {string} species
 * @property {string} [treeId] só se o usuário escolheu evoluir uma árvore existente
 * @property {string} [completedAt] ISO do término real da sessão (ignorado se inválido ou no futuro)
 */

/**
 * @typedef {Object} CompleteSessionResult
 * @property {string} treeId
 * @property {boolean} isNewTree
 * @property {number} stagesGained
 * @property {number} finalStage
 */

const defaultColumns = [
  { id: 'todo', name: 'A fazer', order: 0, isDone: false },
  { id: 'doing', name: 'Em andamento', order: 1, isDone: false },
  { id: 'done', name: 'Concluído', order: 2, isDone: true },
]

/** @type {import('../types.js').Settings} */
export const defaultSettings = {
  theme: 'system',
  dailyGoalMinutes: null,
  notifyOnComplete: false,
  soundOnComplete: false,
}

/** @type {import('../types.js').AppData} */
const initialData = {
  schemaVersion: 1,
  notebooks: [],
  columns: defaultColumns,
  tasks: [],
  sessions: [],
  trees: [],
  settings: defaultSettings,
}

// Storage próprio: avisa a tela (StorageWarning) quando não dá para gravar (cota cheia ou bloqueado).
let storageFailing = false
const safeStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
      if (storageFailing) {
        storageFailing = false
        window.dispatchEvent(new Event('grove:storage-ok'))
      }
    } catch (e) {
      storageFailing = true
      const quota = e?.name === 'QuotaExceededError' || e?.code === 22
      window.dispatchEvent(new CustomEvent('grove:storage-error', { detail: { quota } }))
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignora */
    }
  },
}

const cleanTags = (tags = []) => [...new Set(tags.map((t) => String(t).trim()).filter(Boolean))]

const isStr = (v) => typeof v === 'string'
const biomeOk = (b) => isStr(b) && Object.hasOwn(BIOMES, b)
const speciesOk = (b, sp) => biomeOk(b) && BIOMES[b].species.some((x) => x.id === sp)

function sanitizeSource(x) {
  if (!x || !isStr(x.id) || !['link', 'youtube', 'note'].includes(x.type)) return null
  const base = { id: x.id, type: x.type, title: isStr(x.title) ? x.title : '', tags: cleanTags(x.tags) }
  if (x.type === 'note') return { ...base, text: isStr(x.text) ? x.text : '' }
  const url = safeHttpUrl(x.url)
  return url ? { ...base, url } : null
}

const THEMES = ['system', 'light', 'dark']
const validDate = (v) => isStr(v) && Number.isFinite(Date.parse(v))

/** ISO válido e que não está no futuro; senão undefined. */
function validIsoNotFuture(v) {
  if (!isStr(v)) return undefined
  const t = Date.parse(v)
  return Number.isFinite(t) && t <= Date.now() ? new Date(t).toISOString() : undefined
}

/**
 * Valida cada campo de Settings, caindo no padrão.
 * @param {unknown} x
 * @returns {import('../types.js').Settings}
 */
function sanitizeSettings(x) {
  const s = x && typeof x === 'object' ? x : {}
  const goal = s.dailyGoalMinutes
  return {
    theme: THEMES.includes(s.theme) ? s.theme : defaultSettings.theme,
    dailyGoalMinutes: Number.isInteger(goal) && goal >= 15 && goal <= 600 ? goal : null,
    notifyOnComplete: s.notifyOnComplete === true,
    soundOnComplete: s.soundOnComplete === true,
  }
}

function sanitizeNotebook(n) {
  if (!n || !isStr(n.id) || !isStr(n.name) || !biomeOk(n.biome)) return null
  return {
    id: n.id,
    name: n.name,
    biome: n.biome,
    createdAt: validDate(n.createdAt) ? n.createdAt : new Date().toISOString(),
    sources: (Array.isArray(n.sources) ? n.sources : []).map(sanitizeSource).filter(Boolean),
  }
}

/** Whitelist de campos de Session. @returns {import('../types.js').Session | null} */
function sanitizeSession(x) {
  if (!x || !isStr(x.id) || !validDate(x.completedAt) || !biomeOk(x.biome)) return null
  if (!Number.isFinite(x.minutes) || x.minutes < 1 || x.minutes > 1440) return null
  /** @type {import('../types.js').Session} */
  const session = {
    id: x.id,
    completedAt: x.completedAt,
    minutes: x.minutes,
    biome: x.biome,
    species: isStr(x.species) ? x.species : '',
  }
  if (isStr(x.taskId)) session.taskId = x.taskId
  if (isStr(x.notebookId)) session.notebookId = x.notebookId
  if (isStr(x.treeId)) session.treeId = x.treeId
  if (Number.isFinite(x.stagesGained)) session.stagesGained = x.stagesGained
  return session
}

/** Whitelist de campos de Tree. @param {Set<string>} notebookIds @returns {import('../types.js').Tree | null} */
function sanitizeTree(x, notebookIds) {
  if (!x || !isStr(x.id) || !speciesOk(x.biome, x.species)) return null
  /** @type {import('../types.js').Tree} */
  const tree = {
    id: x.id,
    biome: x.biome,
    species: x.species,
    stages: Math.min(MAX_STAGES, Math.max(1, Math.round(Number(x.stages) || 1))),
    plantedAt: validDate(x.plantedAt) ? x.plantedAt : new Date().toISOString(),
  }
  if (isStr(x.notebookId) && notebookIds.has(x.notebookId)) tree.notebookId = x.notebookId
  return tree
}

const PRIORITIES = ['baixa', 'media', 'alta']
const DUE_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Garante um Column utilizável. Backups antigos (schemaVersion 1 sem `isDone`)
 * mantêm a coluna `done` como conclusão.
 * @param {unknown} x
 * @returns {import('../types.js').Column | null}
 */
function sanitizeColumn(x) {
  if (!x || !isStr(x.id) || !isStr(x.name)) return null
  const name = x.name.trim()
  if (!name) return null
  return {
    id: x.id,
    name,
    order: Number.isFinite(x.order) ? x.order : 0,
    isDone: x.isDone === true || (x.isDone === undefined && x.id === 'done'),
  }
}

/**
 * Garante uma Task utilizável. Título é obrigatório; `notebookId` só entra se o
 * caderno existir (dados antigos podem vir sem caderno — a tela mostra "Sem caderno").
 * @param {unknown} x
 * @param {Set<string>} notebookIds
 * @param {Set<string>} columnIds
 * @returns {import('../types.js').Task | null}
 */
function sanitizeTask(x, notebookIds, columnIds) {
  if (!x || !isStr(x.id) || !isStr(x.columnId) || !columnIds.has(x.columnId)) return null
  const title = isStr(x.title) ? x.title.trim() : ''
  if (!title) return null
  /** @type {import('../types.js').Task} */
  const task = {
    id: x.id,
    title,
    description: isStr(x.description) ? x.description : '',
    priority: PRIORITIES.includes(x.priority) ? x.priority : 'media',
    columnId: x.columnId,
    order: Number.isFinite(x.order) ? x.order : 0,
  }
  if (isStr(x.dueDate) && DUE_DATE_RE.test(x.dueDate)) task.dueDate = x.dueDate
  if (isStr(x.notebookId) && notebookIds.has(x.notebookId)) task.notebookId = x.notebookId
  return task
}

/**
 * Converte qualquer objeto no formato de AppData válido (usado na importação e na hidratação
 * do localStorage). Campos inválidos são descartados; nunca lança.
 * @param {any} d
 * @returns {Omit<import('../types.js').AppData, 'schemaVersion'> & { settings: import('../types.js').Settings }}
 */
function sanitizeAppData(d) {
  const list = (v) => (Array.isArray(v) ? v : [])
  const notebooks = list(d?.notebooks).map(sanitizeNotebook).filter(Boolean)
  const notebookIds = new Set(notebooks.map((n) => n.id))

  const rawColumns = list(d?.columns).map(sanitizeColumn).filter(Boolean)
  const columns = rawColumns.length ? rawColumns : defaultColumns.map((c) => ({ ...c }))
  const columnIds = new Set(columns.map((c) => c.id))

  const tasks = list(d?.tasks)
    .map((t) => sanitizeTask(t, notebookIds, columnIds))
    .filter(Boolean)
  const sessions = list(d?.sessions).map(sanitizeSession).filter(Boolean)
  const trees = list(d?.trees)
    .map((t) => sanitizeTree(t, notebookIds))
    .filter(Boolean)

  return { notebooks, columns, tasks, sessions, trees, settings: sanitizeSettings(d?.settings) }
}

export const useStore = create()(
  persist(
    (set, get) => ({
      ...initialData,

      addNotebook: (n) => {
        const id = uid()
        set((s) => ({
          notebooks: [...s.notebooks, { ...n, id, createdAt: new Date().toISOString(), sources: [] }],
        }))
        return id
      },
      updateNotebook: (id, patch) =>
        set((s) => ({ notebooks: s.notebooks.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
      removeNotebook: (id) =>
        set((s) => {
          const removedTaskIds = new Set(s.tasks.filter((t) => t.notebookId === id).map((t) => t.id))
          return {
            notebooks: s.notebooks.filter((n) => n.id !== id),
            tasks: s.tasks.filter((t) => t.notebookId !== id),
            sessions: s.sessions.map((x) => ({
              ...x,
              notebookId: x.notebookId === id ? undefined : x.notebookId,
              taskId: removedTaskIds.has(x.taskId) ? undefined : x.taskId,
            })),
            trees: s.trees.map((t) => (t.notebookId === id ? { ...t, notebookId: undefined } : t)),
          }
        }),

      addSource: (notebookId, src) => {
        const id = uid()
        const url = src.type === 'note' ? undefined : safeHttpUrl(src.url)
        if (src.type !== 'note' && !url) throw new Error('URL inválida.')
        const source = { ...src, id, url, tags: cleanTags(src.tags) }
        set((s) => ({
          notebooks: s.notebooks.map((n) =>
            n.id === notebookId ? { ...n, sources: [...n.sources, source] } : n,
          ),
        }))
        return id
      },
      updateSource: (notebookId, sourceId, patch) => {
        if (patch.url !== undefined && !safeHttpUrl(patch.url)) throw new Error('URL inválida.')
        set((s) => ({
          notebooks: s.notebooks.map((n) =>
            n.id !== notebookId
              ? n
              : {
                  ...n,
                  sources: n.sources.map((x) =>
                    x.id !== sourceId
                      ? x
                      : {
                          ...x,
                          ...patch,
                          ...(patch.url !== undefined && { url: safeHttpUrl(patch.url) }),
                          ...(patch.tags && { tags: cleanTags(patch.tags) }),
                        },
                  ),
                },
          ),
        }))
      },
      removeSource: (notebookId, sourceId) =>
        set((s) => ({
          notebooks: s.notebooks.map((n) =>
            n.id === notebookId ? { ...n, sources: n.sources.filter((x) => x.id !== sourceId) } : n,
          ),
        })),

      addColumn: (name) => {
        const trimmed = String(name ?? '').trim()
        if (!trimmed) throw new Error('O nome da coluna não pode ficar vazio.')
        const id = uid()
        set((s) => ({
          columns: [
            ...s.columns,
            { id, name: trimmed, order: Math.max(-1, ...s.columns.map((c) => c.order)) + 1, isDone: false },
          ],
        }))
        return id
      },
      renameColumn: (id, name) => {
        const trimmed = String(name ?? '').trim()
        if (!trimmed) throw new Error('O nome da coluna não pode ficar vazio.')
        set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, name: trimmed } : c)) }))
      },
      // Marca `id` como coluna de conclusão (as outras ficam normais). null = nenhuma.
      setDoneColumn: (id) =>
        set((s) => ({ columns: s.columns.map((c) => ({ ...c, isDone: c.id === id })) })),
      removeColumn: (id) =>
        set((s) => {
          if (s.columns.length <= 1) return s // nunca remover a última coluna
          const removed = new Set(s.tasks.filter((t) => t.columnId === id).map((t) => t.id))
          return {
            columns: s.columns.filter((c) => c.id !== id),
            tasks: s.tasks.filter((t) => t.columnId !== id),
            sessions: s.sessions.map((x) => (removed.has(x.taskId) ? { ...x, taskId: undefined } : x)),
          }
        }),

      addTask: (t) => {
        const id = uid()
        set((s) => {
          // Ordem sempre dentro da coluna de destino: último + 1.
          const inColumn = s.tasks.filter((x) => x.columnId === t.columnId)
          const order = inColumn.reduce((max, x) => Math.max(max, x.order), -1) + 1
          return { tasks: [...s.tasks, { ...t, id, order }] }
        })
        return id
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          sessions: s.sessions.map((x) => (x.taskId === id ? { ...x, taskId: undefined } : x)),
        })),

      // Move a tarefa e reindexa `order` das colunas afetadas (spec 03, seção 3).
      moveTask: (taskId, toColumnId, toIndex) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId)
          if (!task || !s.columns.some((c) => c.id === toColumnId)) return s
          const byOrder = (a, b) => a.order - b.order
          const others = s.tasks.filter((t) => t.id !== taskId)
          const fromColumnId = task.columnId
          const fromTasks = others.filter((t) => t.columnId === fromColumnId).sort(byOrder)
          const toTasks = others.filter((t) => t.columnId === toColumnId).sort(byOrder)
          const index = Math.max(0, Math.min(toIndex, toTasks.length))
          const nextTo = [...toTasks.slice(0, index), { ...task, columnId: toColumnId }, ...toTasks.slice(index)]

          /** @type {Map<string, { order: number, columnId?: string }>} */
          const updates = new Map()
          nextTo.forEach((t, i) => updates.set(t.id, { order: i, columnId: toColumnId }))
          if (fromColumnId !== toColumnId) fromTasks.forEach((t, i) => updates.set(t.id, { order: i }))

          return { tasks: s.tasks.map((t) => (updates.has(t.id) ? { ...t, ...updates.get(t.id) } : t)) }
        }),

      addSession: (x) =>
        set((s) => ({ sessions: [...s.sessions, { ...x, id: uid(), completedAt: new Date().toISOString() }] })),

      // Conclui a sessão: planta árvore nova ou evolui a existente e grava a Session.
      // A tela NUNCA mexe em `trees` direto — sempre por aqui.
      completeSession: (input) => {
        const s = get()

        // Vínculo só vale se ainda existir (tarefa/caderno podem ter sido excluídos na sessão).
        const task = input.taskId ? s.tasks.find((t) => t.id === input.taskId) : undefined
        const wantedNotebookId = task ? (task.notebookId ?? input.notebookId) : input.notebookId
        const notebookId =
          wantedNotebookId && s.notebooks.some((n) => n.id === wantedNotebookId)
            ? wantedNotebookId
            : undefined

        // Horário real do término (o watcher calcula por startedAt + duração); inválido/futuro = agora.
        const when = validIsoNotFuture(input.completedAt) ?? new Date().toISOString()

        const gain = stagesForMinutes(input.minutes)
        const existing = input.treeId ? s.trees.find((t) => t.id === input.treeId) : undefined

        let tree
        let isNewTree
        if (existing) {
          // Evolui a existente: espécie e bioma são os dela, teto em MAX_STAGES.
          tree = { ...existing, stages: Math.min(MAX_STAGES, existing.stages + gain) }
          isNewTree = false
        } else {
          // Planta nova: nasce já com os estágios da sessão.
          tree = {
            id: uid(),
            biome: input.biome,
            species: input.species,
            stages: Math.min(MAX_STAGES, gain),
            plantedAt: when,
            notebookId,
          }
          isNewTree = true
        }

        const stagesGained = isNewTree ? tree.stages : tree.stages - existing.stages
        const session = {
          id: uid(),
          completedAt: when,
          minutes: input.minutes,
          taskId: task?.id,
          notebookId,
          biome: tree.biome,
          species: tree.species,
          treeId: tree.id,
          stagesGained,
        }

        set((st) => ({
          trees: isNewTree
            ? [...st.trees, tree]
            : st.trees.map((t) => (t.id === tree.id ? tree : t)),
          sessions: [...st.sessions, session],
        }))

        return { treeId: tree.id, isNewTree, stagesGained, finalStage: tree.stages }
      },

      exportData: () => {
        const { schemaVersion, notebooks, columns, tasks, sessions, trees, settings } = get()
        return JSON.stringify({ schemaVersion, notebooks, columns, tasks, sessions, trees, settings }, null, 2)
      },
      importData: (json) => {
        let d
        try { d = JSON.parse(json) } catch { throw new Error('O arquivo não é um JSON válido.') }
        if (!d || d.schemaVersion !== 1) throw new Error('Arquivo de backup inválido ou de outra versão.')
        // Backups antigos (sem `settings`) continuam válidos: as configurações caem no padrão.
        set(sanitizeAppData(d))
      },
      /** @param {Partial<import('../types.js').Settings>} patch */
      updateSettings: (patch) =>
        set((s) => ({ settings: sanitizeSettings({ ...s.settings, ...patch }) })),
      resetData: () => set({ ...initialData }),
    }),
    {
      name: 'grove:v1',
      // v2: Column ganhou `isDone` (spec 03, C1). Dados antigos mantêm `done` como conclusão.
      // v3: novo campo `settings` (schemaVersion do backup continua 1: o campo é opcional).
      version: 3,
      storage: createJSONStorage(() => safeStorage),
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== 'object') return persisted
        let next = persisted
        if (version < 2 && Array.isArray(next.columns)) {
          next = {
            ...next,
            columns: next.columns.map((c) => ({ ...c, isDone: c.isDone ?? c.id === 'done' })),
          }
        }
        if (version < 3) next = { ...next, settings: next.settings ?? defaultSettings }
        return next
      },
      // O estado salvo passa pela mesma validação da importação: localStorage corrompido não derruba telas.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted && typeof persisted === 'object' ? sanitizeAppData(persisted) : {}),
      }),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        notebooks: s.notebooks,
        columns: s.columns,
        tasks: s.tasks,
        sessions: s.sessions,
        trees: s.trees,
        settings: s.settings,
      }),
    },
  ),
)
