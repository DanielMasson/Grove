import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import { useStore } from '../../store/useStore'

const NAME_MAX = 60

/**
 * Modal curto para criar ou renomear coluna, com a opção de marcá-la como
 * coluna de conclusão (C1 livre da spec 03).
 * @param {{
 *   open: boolean,
 *   initial?: import('../../types.js').Column,
 *   onClose: () => void,
 *   onSubmit: (data: { name: string, isDone: boolean }) => void,
 * }} props
 */
export default function ColumnForm({ open, initial, onClose, onSubmit }) {
  const columns = useStore((s) => s.columns)
  const [name, setName] = useState('')
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setIsDone(Boolean(initial?.isDone))
    setError('')
  }, [open, initial])

  const trimmed = name.trim()
  const duplicate = Boolean(trimmed) && columns.some((c) => c.id !== initial?.id && c.name === trimmed)

  const submit = (e) => {
    e.preventDefault()
    if (!trimmed) {
      setError('Informe o nome da coluna.')
      return
    }
    if (trimmed.length > NAME_MAX) {
      setError(`O nome pode ter no máximo ${NAME_MAX} caracteres.`)
      return
    }
    setError('')
    onSubmit({ name: trimmed, isDone })
  }

  return (
    <Modal open={open} title={initial ? 'Editar coluna' : 'Nova coluna'} onClose={onClose}>
      <form className="task-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="cf-name">Nome</label>
          <input
            id="cf-name"
            type="text"
            value={name}
            maxLength={NAME_MAX}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'cf-name-error' : undefined}
          />
          {error && (
            <p id="cf-name-error" className="field-error" role="alert">
              {error}
            </p>
          )}
          {duplicate && !error && <p className="hint">Já existe uma coluna com esse nome.</p>}
        </div>

        <div className="field">
          <label className="cf-done">
            <input type="checkbox" checked={isDone} onChange={(e) => setIsDone(e.target.checked)} />
            Marcar como coluna de conclusão
          </label>
          <p className="hint">O Foco esconde as tarefas desta coluna da lista de tarefas abertas.</p>
        </div>

        <div className="dialog-actions">
          <button type="submit" className="button-primary">
            Salvar
          </button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}
