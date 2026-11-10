import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

/**
 * Uma coluna do kanban: cabeçalho (nome, contagem, renomear, remover) e a lista
 * de cartões. A `<ul>` é a área de soltura da coluna.
 * @param {{
 *   column: import('../../types.js').Column,
 *   tasks: import('../../types.js').Task[],
 *   totalInColumn: number,
 *   columns: import('../../types.js').Column[],
 *   notebookNameOf: (task: import('../../types.js').Task) => string | null,
 *   canRemove: boolean,
 *   onEdit: () => void,
 *   onRemove: () => void,
 *   onEditTask: (task: import('../../types.js').Task) => void,
 *   onRemoveTask: (task: import('../../types.js').Task) => void,
 *   onMoveTask: (taskId: string, toColumnId: string) => void,
 *   emptyMessage: string,
 * }} props
 */
export default function KanbanColumn({
  column,
  tasks,
  totalInColumn,
  columns,
  notebookNameOf,
  canRemove,
  onEdit,
  onRemove,
  onEditTask,
  onRemoveTask,
  onMoveTask,
  emptyMessage,
}) {
  const { setNodeRef } = useDroppable({ id: column.id, data: { type: 'column' } })
  const headingId = `kb-col-${column.id}`

  return (
    <section className="kb-col" aria-labelledby={headingId}>
      <header className="kb-col-head">
        <h2 id={headingId} className="kb-col-title">
          {column.name}
          <span className="kb-count">
            {tasks.length === totalInColumn ? totalInColumn : `${tasks.length}/${totalInColumn}`}
          </span>
          {column.isDone && <span className="kb-done-tag">Conclusão</span>}
        </h2>
        <div className="kb-col-actions">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Renomear coluna ${column.name}`}
          >
            Renomear
          </button>
          <button
            type="button"
            className="button-danger"
            onClick={onRemove}
            disabled={!canRemove}
            aria-describedby={!canRemove ? `${headingId}-last` : undefined}
          >
            Remover
          </button>
          {!canRemove && (
            <span id={`${headingId}-last`} className="sr-only">
              Não é possível remover a última coluna.
            </span>
          )}
        </div>
      </header>

      <ul className="kb-col-list" ref={setNodeRef}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              notebookName={notebookNameOf(task)}
              done={column.isDone}
              columns={columns}
              onEdit={() => onEditTask(task)}
              onDelete={() => onRemoveTask(task)}
              onMove={(toColumnId) => onMoveTask(task.id, toColumnId)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <li className="kb-empty" aria-live="polite">
            {emptyMessage}
          </li>
        )}
      </ul>
    </section>
  )
}
