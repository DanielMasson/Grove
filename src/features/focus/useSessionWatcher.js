import { useEffect } from 'react'
import { useTimer } from './useTimer'
import { useStore } from '../../store/useStore'
import { DEFAULT_BIOME } from '../../biomes/config'

// Roda no App.jsx (global), não na FocusPage: o usuário pode navegar para Tarefas/Cadernos
// durante a sessão e ela precisa concluir mesmo fora da tela de Foco.
// O estado do timer é global (Zustand), então o watcher também é.
export function useSessionWatcher() {
  useEffect(() => {
    const id = setInterval(() => {
      const timer = useTimer.getState()
      if (!timer.active || timer.progress() < 1) return

      // Segurança: sem espécie e sem árvore escolhida não há o que plantar (estado impossível).
      if (!timer.treeId && !timer.species) {
        timer.giveUp()
        return
      }

      // Trava: complete() marca active=false na hora, então o próximo tick não repete
      // (idempotente também no StrictMode, que monta o efeito duas vezes).
      const result = useStore.getState().completeSession({
        minutes: timer.minutes,
        taskId: timer.taskId,
        notebookId: timer.notebookId,
        biome: timer.biome ?? DEFAULT_BIOME,
        species: timer.species ?? '',
        treeId: timer.treeId,
      })
      timer.complete(result)
    }, 250)
    return () => clearInterval(id)
  }, [])
}
