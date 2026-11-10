import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { GROWTH_STAGES, MAX_STAGES } from '../../biomes/config'

export default function CompletionDialog({ result, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const message = result.isNewTree
    ? 'Árvore plantada!'
    : `Sua árvore subiu para o estágio ${GROWTH_STAGES[result.finalStage - 1]}!`
  const detail = result.isNewTree
    ? `Depois da sua sessão, ela já está em ${GROWTH_STAGES[result.finalStage - 1]} (${
        result.finalStage
      } de ${MAX_STAGES}).`
    : `Ela ganhou ${result.stagesGained} estágio${result.stagesGained > 1 ? 's' : ''} nesta sessão.`

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <p className="dialog-emoji" aria-hidden="true">
          🌳
        </p>
        <h2 id="completion-title">{message}</h2>
        <p>{detail}</p>
        <div className="dialog-actions">
          <Link to="/floresta" className="button-primary" onClick={onClose}>
            Ver na Floresta
          </Link>
          <button type="button" ref={closeRef} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
