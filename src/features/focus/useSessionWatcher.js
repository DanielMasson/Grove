import { useEffect } from 'react'
import { useTimer } from './useTimer'
import { useStore } from '../../store/useStore'
import { DEFAULT_BIOME } from '../../biomes/config'
import { notifySessionComplete } from './completionAlerts'

// Roda no App.jsx (global), não na FocusPage: o usuário pode navegar para Tarefas/Cadernos
// durante a sessão e ela precisa concluir mesmo fora da tela de Foco.
// O estado do timer é global (Zustand), então o watcher também é.

function check() {
  const timer = useTimer.getState()
  if (!timer.active || timer.progress() < 1) return

  // Segurança: sem espécie e sem árvore escolhida não há o que plantar (estado impossível).
  if (!timer.treeId && !timer.species) {
    timer.giveUp()
    return
  }

  // Horário real do término (início + pausas + duração), não o momento em que o watcher notou:
  // se o notebook dormiu ou a aba ficou oculta, a sessão continua no dia certo.
  const completedAt = new Date(timer.startedAt + timer.pausedTotal + timer.minutes * 60_000).toISOString()

  // Trava: complete() marca active=false na hora, então a próxima checagem não repete
  // (idempotente também no StrictMode, que monta o efeito duas vezes).
  const result = useStore.getState().completeSession({
    minutes: timer.minutes,
    taskId: timer.taskId,
    notebookId: timer.notebookId,
    biome: timer.biome ?? DEFAULT_BIOME,
    species: timer.species ?? '',
    treeId: timer.treeId,
    completedAt,
  })
  timer.complete(result)
  notifySessionComplete(useStore.getState().settings)
}

export function useSessionWatcher() {
  useEffect(() => {
    const id = setInterval(check, 250)
    // Navegadores freiam setInterval em aba oculta: confere de novo ao voltar.
    document.addEventListener('visibilitychange', check)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('focus', check)
    }
  }, [])
}
