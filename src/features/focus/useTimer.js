import { create } from 'zustand'
import { DEFAULT_BIOME } from '../../biomes/config'

// Sessão ativa vive SÓ EM MEMÓRIA (de propósito): fechar/recarregar a aba mata a sessão e a árvore.
// O tempo é calculado pela diferença de horários, não por contagem de setInterval (RNF04).

export const MIN_MINUTES = 15
export const MAX_MINUTES = 120
export const PAUSE_AFTER_MINUTES = 10

/**
 * @typedef {Object} SessionLink
 * @property {string} [taskId]
 * @property {string} [notebookId]
 * @property {import('../../types.js').BiomeId} [biome]
 * @property {string} [species]
 * @property {string} [treeId] só se escolheu evoluir uma árvore existente
 */

const resetSession = {
  active: false,
  pausedAt: undefined,
  pausedTotal: 0,
  taskId: undefined,
  notebookId: undefined,
  biome: undefined,
  species: undefined,
  treeId: undefined,
}

export const useTimer = create((set, get) => ({
  active: false,
  minutes: 25,
  startedAt: 0,
  pausedTotal: 0,
  biome: DEFAULT_BIOME,
  justCompleted: undefined,

  /** @param {number} minutes @param {SessionLink} [link] */
  start: (minutes, link) =>
    set({
      active: true,
      minutes,
      startedAt: Date.now(),
      pausedAt: undefined,
      pausedTotal: 0,
      justCompleted: undefined,
      biome: link?.biome ?? DEFAULT_BIOME,
      species: link?.species,
      taskId: link?.taskId,
      notebookId: link?.notebookId,
      treeId: link?.treeId,
    }),
  pause: () => set((s) => (s.pausedAt || !s.canPause() ? s : { pausedAt: Date.now() })),
  resume: () =>
    set((s) => (s.pausedAt ? { pausedAt: undefined, pausedTotal: s.pausedTotal + (Date.now() - s.pausedAt) } : s)),
  giveUp: () => set({ ...resetSession }),

  // Chamado pelo useSessionWatcher quando progress() >= 1: zera o timer e guarda o resultado p/ o diálogo.
  complete: (result) => set({ ...resetSession, justCompleted: result }),
  clearCompleted: () => set({ justCompleted: undefined }),

  canPause: () => get().elapsedMs() >= PAUSE_AFTER_MINUTES * 60_000,

  elapsedMs: () => {
    const s = get()
    if (!s.active) return 0
    const now = s.pausedAt ?? Date.now()
    return Math.max(0, now - s.startedAt - s.pausedTotal)
  },
  progress: () => {
    const s = get()
    return s.active ? Math.min(1, s.elapsedMs() / (s.minutes * 60_000)) : 0
  },
}))
