import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

// Tarefas na coluna "Concluído" não servem para foco.
const isDoneTask = (columnId, columns) =>
  columns.some((c) => c.id === columnId && (c.id === 'done' || c.name === 'Concluído'))

export default function LinkPicker({ taskId, notebookId, onChange, disabled }) {
  const tasks = useStore((s) => s.tasks)
  const columns = useStore((s) => s.columns)
  const notebooks = useStore((s) => s.notebooks)

  const selectedTask = tasks.find((t) => t.id === taskId)
  const taskLockedNotebook = Boolean(selectedTask?.notebookId)

  const availableTasks = tasks.filter((t) => !isDoneTask(t.columnId, columns))

  const onTaskChange = (id) => {
    if (!id) {
      onChange({ taskId: undefined, notebookId })
      return
    }
    const task = tasks.find((t) => t.id === id)
    // Tarefa define o caderno (toda tarefa pertence a um caderno).
    onChange({ taskId: id, notebookId: task?.notebookId ?? notebookId })
  }

  if (notebooks.length === 0) {
    return (
      <fieldset className="pickers-fieldset">
        <legend>Vínculo (opcional)</legend>
        <p className="hint">
          Você ainda não tem cadernos.{' '}
          <Link to="/cadernos">Crie seu primeiro caderno</Link> para vincular tarefa, bioma e espécies —
          dá para focar sem vínculo (a sessão usa a planície).
        </p>
      </fieldset>
    )
  }

  return (
    <fieldset className="pickers-fieldset">
      <legend>Vínculo (opcional)</legend>

      <div className="field">
        <label htmlFor="link-task">Tarefa</label>
        <select id="link-task" value={taskId ?? ''} onChange={(e) => onTaskChange(e.target.value)} disabled={disabled}>
          <option value="">Sem tarefa</option>
          {availableTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        {availableTasks.length === 0 && <p className="hint">Nenhuma tarefa aberta no kanban.</p>}
      </div>

      <div className="field">
        <label htmlFor="link-notebook">Caderno</label>
        <select
          id="link-notebook"
          value={notebookId ?? ''}
          onChange={(e) => onChange({ taskId, notebookId: e.target.value || undefined })}
          disabled={disabled || taskLockedNotebook}
          aria-describedby={taskLockedNotebook ? 'link-notebook-why' : undefined}
        >
          <option value="">Sem caderno (planície)</option>
          {notebooks.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        {taskLockedNotebook && (
          <p id="link-notebook-why" className="hint">
            Caderno definido pela tarefa selecionada.
          </p>
        )}
      </div>
    </fieldset>
  )
}
