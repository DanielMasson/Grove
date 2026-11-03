import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MAX_STAGES, stagesForMinutes } from '../biomes/config'

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
        set((s) => ({
          notebooks: s.notebooks.filter((n) => n.id !== id),
          tasks: s.tasks.filter((t) => t.notebookId !== id),
          sessions: s.sessions.map((x) => (x.notebookId === id ? { ...x, notebookId: undefined } : x)),
          trees: s.trees.map((t) => (t.notebookId === id ? { ...t, notebookId: undefined } : t)),
        })),

      addColumn: (name) =>
        set((s) => ({ columns: [...s.columns, { id: uid(), name, order: s.columns.length }] })),
      renameColumn: (id, name) =>
        set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, name } : c)) })),
      removeColumn: (id) =>
        set((s) => ({
          columns: s.columns.filter((c) => c.id !== id),
          tasks: s.tasks.filter((t) => t.columnId !== id),
        })),

      addTask: (t) => {
        const id = uid()
        set((s) => ({ tasks: [...s.tasks, { ...t, id, order: s.tasks.length }] }))
        return id
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

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
        const d = JSON.parse(json)
        if (d.schemaVersion !== 1) throw new Error('Arquivo de backup inválido ou de outra versão.')
        set({
          notebooks: d.notebooks ?? [],
          columns: d.columns?.length ? d.columns : defaultColumns,
          tasks: d.tasks ?? [],
          sessions: d.sessions ?? [],
          trees: d.trees ?? [],
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
