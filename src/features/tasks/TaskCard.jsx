import { Link } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDueDate, isTaskOverdue, PRIORITY_LABELS } from '../../lib/kanban'

/**
 * Conteúdo do cartão (título, prazo, prioridade, ações). É usado pelo cartão
 * arrastável e pelo DragOverlay — sem hooks de arraste aqui.
 * @param {{
 *   task: import('../../types.js').Task,
 *   notebookName: string | null,
 *   done: boolean,
 *   columns: import('../../types.js').Column[],
 *   interactive?: boolean quando false não renderiza botões (overlay),
 *   dragHandle?: import('react').ReactNode botão "Arrastar" (só no cartão arrastável),
 *   onEdit: () => void,
 *   onDelete: () => void,
 *   onMove: (columnId: string) => void,
 * }} props
 */
export function TaskContent({
  task,
  notebookName,
  done,
  columns,
  interactive = true,
  dragHandle,
  onEdit,
  onDelete,
  onMove,
}) {
  const overdue = isTaskOverdue(task, done)
  const otherColumns = columns.filter((c) => c.id !== task.columnId)

  return (
    <div className="kb-card-body">
      <div className="kb-card-top">
        <span className={`kb-prio kb-prio-${task.priority}`}>
          Prioridade {PRIORITY_LABELS[task.priority]}
        </span>
        {task.dueDate && (
          <span className={`kb-due${overdue ? ' kb-overdue' : ''}`}>
            {overdue && <strong>Atrasada · </strong>}
            {formatDueDate(task.dueDate)}
          </span>
        )}
        {interactive && dragHandle}
      </div>

      <h3 className="kb-card-title">{task.title}</h3>
      {task.description && <p className="kb-card-desc">{task.description}</p>}
      <p className="kb-card-meta">{notebookName ?? 'Sem caderno'}</p>

      {interactive && (
        <div className="kb-card-actions">
          <button type="button" onClick={onEdit}>
            Editar
          </button>
          {!done && (
            <Link
              className="kb-link-btn"
              to={{ pathname: '/foco', search: `?taskId=${task.id}` }}
              aria-label={`Focar na tarefa ${task.title}`}
            >
              Focar
            </Link>
          )}
          <button type="button" className="button-danger" onClick={onDelete}>
            Excluir
          </button>
        </div>
      )}

      {interactive && otherColumns.length > 0 && (
        <div className="kb-card-move">
          <label htmlFor={`move-${task.id}`}>Mover para</label>
          <select id={`move-${task.id}`} value="" onChange={(e) => e.target.value && onMove(e.target.value)}>
            <option value="">Escolher coluna…</option>
            {otherColumns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

/**
 * Cartão arrastável (sortable). Só o botão "Arrastar" é o ativador (B11): o <li> fica sem
 * papel interativo, e os botões/link/select do cartão continuam normais para o teclado.
 * Sensores: PointerSensor com distância de 6 px e KeyboardSensor (configurados em TasksPage).
 * @param {Parameters<typeof TaskContent>[0]} props
 */
export default function TaskCard(props) {
  const { task } = props
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const dragHandle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className="kb-drag-handle"
      aria-label={`Arrastar tarefa ${task.title}`}
      {...attributes}
      {...listeners}
    >
      <span aria-hidden="true">⠿</span>
    </button>
  )

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`kb-card${isDragging ? ' kb-card-dragging' : ''}`}
    >
      <TaskContent {...props} dragHandle={dragHandle} />
    </li>
  )
}
