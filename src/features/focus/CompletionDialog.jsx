import { Link } from 'react-router-dom'
import Modal from '../../components/Modal'
import { GROWTH_STAGES, MAX_STAGES } from '../../biomes/config'

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

/**
 * Diálogo de conclusão da sessão. Usa o `Modal` (<dialog> nativo): prende o foco, fecha com Esc
 * e devolve o foco ao fechar.
 * @param {{ result: import('../../store/useStore.js').CompleteSessionResult, onClose: () => void }} props
 */
export default function CompletionDialog({ result, onClose }) {
  const stage = GROWTH_STAGES[result.finalStage - 1]

  let message
  let detail
  if (result.isNewTree) {
    message = 'Árvore plantada!'
    detail = `Depois da sua sessão, ela já está em ${stage} (${result.finalStage} de ${MAX_STAGES}).`
  } else if (result.stagesGained === 0) {
    message = 'Sua árvore já estava adulta.'
    detail = 'A sessão foi registrada.'
  } else {
    message = `Sua árvore chegou à fase ${stage}!`
    detail = `Ela ganhou ${plural(result.stagesGained, 'estágio', 'estágios')} nesta sessão.`
  }

  return (
    <Modal open title={message} onClose={onClose}>
      <div className="dialog-body">
        <p className="dialog-emoji" aria-hidden="true">
          🌳
        </p>
        <p>{detail}</p>
        <div className="dialog-actions">
          <Link to="/floresta" className="button-primary" onClick={onClose}>
            Ver na Floresta
          </Link>
          <button type="button" autoFocus onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
