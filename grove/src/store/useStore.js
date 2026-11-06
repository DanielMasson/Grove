import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
 */

/**
 * @typedef {Object} CompleteSessionResult
 * @property {string} treeId
 * @property {boolean} isNewTree
 * @property {number} stagesGained
 * @property {number} finalStage
 */

const defaultColumns = [
  { id: 'todo', name: 'A fazer', order: 0 },
  { id: 'doing', name: 'Em andamento', order: 1 },
  { id: 'done', name: 'Concluído', order: 2 },
]

/** @type {import('../types.js').AppData} */
const initialData = {
  schemaVersion: 1,
  notebooks: [],
  columns: defaultColumns,
  tasks: [],
  sessions: [],
  trees: [],
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

function sanitize(d) {
  const notebooks = (d.notebooks ?? [])
    .filter((n) => n && isStr(n.id) && isStr(n.name) && biomeOk(n.biome))
    .map((n) => ({
      id: n.id, name: n.name, biome: n.biome,
      createdAt: isStr(n.createdAt) ? n.createdAt : new Date().toISOString(),
      sources: (n.sources ?? []).map(sanitizeSource).filter(Boolean),
    }))
  const trees = (d.trees ?? [])
    .filter((t) => t && isStr(t.id) && speciesOk(t.biome, t.species))
    .map((t) => ({ ...t, stages: Math.min(MAX_STAGES, Math.max(1, Math.round(Number(t.stages) || 1))) }))
  const sessions = (d.sessions ?? [])
    .filter((x) => x && isStr(x.id) && Number.isFinite(x.minutes) && biomeOk(x.biome))
  return { notebooks, trees, sessions }
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

      addColumn: (name) =>
        set((s) => ({ columns: [...s.columns, { id: uid(), name, order: s.columns.length }] })),
      renameColumn: (id, name) =>
        set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, name } : c)) })),
      removeColumn: (id) =>
        set((s) => {
          const removed = new Set(s.tasks.filter((t) => t.columnId === id).map((t) => t.id))
          return {
            columns: s.columns.filter((c) => c.id !== id),
            tasks: s.tasks.filter((t) => t.columnId !== id),
            sessions: s.sessions.map((x) => (removed.has(x.taskId) ? { ...x, taskId: undefined } : x)),
          }
        }),

      addTask: (t) => {
        const id = uid()
        set((s) => ({ tasks: [...s.tasks, { ...t, id, order: s.tasks.length }] }))
        return id
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          sessions: s.sessions.map((x) => (x.taskId === id ? { ...x, taskId: undefined } : x)),
        })),

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
            plantedAt: new Date().toISOString(),
            notebookId,
          }
          isNewTree = true
        }

        const stagesGained = isNewTree ? tree.stages : tree.stages - existing.stages
        const session = {
          id: uid(),
          completedAt: new Date().toISOString(),
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
        const { schemaVersion, notebooks, columns, tasks, sessions, trees } = get()
        return JSON.stringify({ schemaVersion, notebooks, columns, tasks, sessions, trees }, null, 2)
      },
      importData: (json) => {
        let d
        try { d = JSON.parse(json) } catch { throw new Error('O arquivo não é um JSON válido.') }
        if (!d || d.schemaVersion !== 1) throw new Error('Arquivo de backup inválido ou de outra versão.')
        const { notebooks, trees, sessions } = sanitize(d)
        set({
          notebooks,
          columns: Array.isArray(d.columns) && d.columns.length ? d.columns : defaultColumns,
          tasks: Array.isArray(d.tasks) ? d.tasks : [],
          sessions,
          trees,
        })
      },
      resetData: () => set({ ...initialData }),
    }),
    {
      name: 'grove:v1',
      version: 1,
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        notebooks: s.notebooks,
        columns: s.columns,
        tasks: s.tasks,
        sessions: s.sessions,
        trees: s.trees,
      }),
    },
  ),
)
