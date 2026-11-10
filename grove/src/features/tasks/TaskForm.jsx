import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/Modal'
import { useStore } from '../../store/useStore'
import { PRIORITY_LABELS } from '../../lib/kanban'

const TITLE_MAX = 120
const DUE_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Modal de criar/editar tarefa. Título e caderno são obrigatórios;
 * sem cadernos, mostra link para #/cadernos e desabilita o envio.
 * @param {{
 *   open: boolean,
 *   initial?: import('../../types.js').Task,
 *   onClose: () => void,
 *   onSubmit: (data: {
 *     title: string,
 *     description: string,
 *     dueDate: string,
 *     priority: import('../../types.js').Priority,
 *     notebookId: string,
 *     columnId: string,
 *   }) => void,
 * }} props
 */
export default function TaskForm({ open, initial, onClose, onSubmit }) {
  const notebooks = useStore((s) => s.notebooks)
  const columns = useStore((s) => s.columns)

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.order - b.order),
    [columns],
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('media')
  const [notebookId, setNotebookId] = useState('')
  const [columnId, setColumnId] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setDescription(initial?.description ?? '')
    setDueDate(initial?.dueDate ?? '')
    setPriority(initial?.priority ?? 'media')
    setNotebookId(initial?.notebookId ?? '')
    setColumnId(
      initial && sortedColumns.some((c) => c.id === initial.columnId)
        ? initial.columnId
        : (sortedColumns[0]?.id ?? ''),
    )
    setErrors({})
  }, [open, initial, sortedColumns])

  const noNotebooks = notebooks.length === 0
  const noColumns = sortedColumns.length === 0

  const submit = (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    /** @type {Record<string, string>} */
    const next = {}
    if (!trimmed) next.title = 'Informe o título da tarefa.'
    else if (trimmed.length > TITLE_MAX) next.title = `O título pode ter no máximo ${TITLE_MAX} caracteres.`
    if (!notebookId) next.notebookId = 'Escolha o caderno (matéria) da tarefa.'
    if (dueDate && !DUE_DATE_RE.test(dueDate)) next.dueDate = 'Use uma data válida.'
    if (!columnId || !sortedColumns.some((c) => c.id === columnId)) {
      next.columnId = 'Escolha uma coluna.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onSubmit({ title: trimmed, description, dueDate, priority, notebookId, columnId })
  }

  return (
    <Modal open={open} title={initial ? 'Editar tarefa' : 'Nova tarefa'} onClose={onClose}>
      <form className="task-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="tf-title">Título *</label>
          <input
            id="tf-title"
            type="text"
            value={title}
            maxLength={TITLE_MAX}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors((prev) => ({ ...prev, title: undefined }))
            }}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'tf-title-error' : undefined}
          />
          {errors.title && (
            <p id="tf-title-error" className="field-error" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="tf-description">Descrição</label>
          <textarea
            id="tf-description"
            value={description}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="tf-notebook">Caderno *</label>
          <select
            id="tf-notebook"
            value={notebookId}
            disabled={noNotebooks}
            onChange={(e) => {
              setNotebookId(e.target.value)
              setErrors((prev) => ({ ...prev, notebookId: undefined }))
            }}
            aria-invalid={errors.notebookId ? true : undefined}
            aria-describedby={
              errors.notebookId ? 'tf-notebook-error' : noNotebooks ? 'tf-notebook-empty' : undefined
            }
          >
            <option value="">Escolher caderno…</option>
            {notebooks.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
          {noNotebooks && (
            <p id="tf-notebook-empty" className="hint">
              Você ainda não tem cadernos. <Link to="/cadernos">Crie um caderno</Link> para vincular a
              tarefa a uma matéria.
            </p>
          )}
          {errors.notebookId && (
            <p id="tf-notebook-error" className="field-error" role="alert">
              {errors.notebookId}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="tf-column">Coluna</label>
          <select
            id="tf-column"
            value={columnId}
            disabled={noColumns}
            onChange={(e) => {
              setColumnId(e.target.value)
              setErrors((prev) => ({ ...prev, columnId: undefined }))
            }}
            aria-invalid={errors.columnId ? true : undefined}
            aria-describedby={errors.columnId ? 'tf-column-error' : undefined}
          >
            {sortedColumns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.columnId && (
            <p id="tf-column-error" className="field-error" role="alert">
              {errors.columnId}
            </p>
          )}
        </div>

        <div className="task-form-row">
          <div className="field">
            <label htmlFor="tf-priority">Prioridade</label>
            <select id="tf-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="tf-due">Prazo</label>
            <input
              id="tf-due"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                setErrors((prev) => ({ ...prev, dueDate: undefined }))
              }}
              aria-invalid={errors.dueDate ? true : undefined}
              aria-describedby={errors.dueDate ? 'tf-due-error' : undefined}
            />
            {errors.dueDate && (
              <p id="tf-due-error" className="field-error" role="alert">
                {errors.dueDate}
              </p>
            )}
          </div>
        </div>

        <div className="dialog-actions">
          <button type="submit" className="button-primary" disabled={noNotebooks || noColumns}>
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
