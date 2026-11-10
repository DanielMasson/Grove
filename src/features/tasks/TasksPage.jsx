import { useMemo, useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useStore } from '../../store/useStore'
import { normalize } from '../../lib/search'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { isDoneTask } from '../../lib/kanban'
import KanbanColumn from './KanbanColumn'
import { TaskContent } from './TaskCard'
import TaskForm from './TaskForm'
import ColumnForm from './ColumnForm'
import ConfirmDialog from '../../components/ConfirmDialog'
import './tasks.css'

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks)
  const columns = useStore((s) => s.columns)
  const notebooks = useStore((s) => s.notebooks)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)
  const moveTask = useStore((s) => s.moveTask)
  const addColumn = useStore((s) => s.addColumn)
  const renameColumn = useStore((s) => s.renameColumn)
  const removeColumn = useStore((s) => s.removeColumn)
  const setDoneColumn = useStore((s) => s.setDoneColumn)

  const sortedColumns = useMemo(() => [...columns].sort((a, b) => a.order - b.order), [columns])

  // Filtros (RF15 / C2): caderno, prioridade e busca por título.
  const [filterNotebook, setFilterNotebook] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const search = debouncedQuery.trim()

  const filtersActive = Boolean(filterNotebook || filterPriority || search)

  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (!filterNotebook || t.notebookId === filterNotebook) &&
          (!filterPriority || t.priority === filterPriority) &&
          (!search || normalize(t.title).includes(normalize(search))),
      ),
    [tasks, filterNotebook, filterPriority, search],
  )

  const notebookNameOf = (task) => notebooks.find((n) => n.id === task.notebookId)?.name ?? null

  // ----- Formulários e confirmações -----
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [columnFormOpen, setColumnFormOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [columnToDelete, setColumnToDelete] = useState(null)

  const openCreateTask = () => {
    setEditingTask(null)
    setTaskFormOpen(true)
  }
  const openEditTask = (task) => {
    setEditingTask(task)
    setTaskFormOpen(true)
  }
  const openCreateColumn = () => {
    setEditingColumn(null)
    setColumnFormOpen(true)
  }
  const openEditColumn = (column) => {
    setEditingColumn(column)
    setColumnFormOpen(true)
  }

  const onTaskSubmit = (data) => {
    const patch = {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || undefined,
      priority: data.priority,
      notebookId: data.notebookId,
    }
    if (editingTask) {
      updateTask(editingTask.id, patch)
      if (data.columnId !== editingTask.columnId) moveTask(editingTask.id, data.columnId, 0)
    } else {
      addTask({ ...patch, columnId: data.columnId, order: 0 })
    }
    setTaskFormOpen(false)
    setEditingTask(null)
  }

  const onColumnSubmit = ({ name, isDone }) => {
    if (editingColumn) {
      renameColumn(editingColumn.id, name)
      if (isDone !== Boolean(editingColumn.isDone)) setDoneColumn(isDone ? editingColumn.id : null)
    } else {
      const id = addColumn(name)
      if (isDone) setDoneColumn(id)
    }
    setColumnFormOpen(false)
    setEditingColumn(null)
  }

  // ----- Arrastar e soltar -----
  const [dragTaskId, setDragTaskId] = useState(null)
  const dragTask = dragTaskId ? tasks.find((t) => t.id === dragTaskId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const titleOf = (id) => tasks.find((t) => t.id === id)?.title ?? 'tarefa'
  const columnNameOf = (id) => columns.find((c) => c.id === id)?.name ?? 'coluna'

  // Anúncios do dnd-kit em português (spec 03, seção 5).
  const announcements = {
    onDragStart: ({ active }) => `Pegou a tarefa ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) => {
      if (!over) return ''
      const overId = String(over.id)
      const isColumn = columns.some((c) => c.id === overId)
      return isColumn
        ? `A tarefa ${titleOf(active.id)} está sobre a coluna ${columnNameOf(overId)}.`
        : `A tarefa ${titleOf(active.id)} está sobre ${titleOf(overId)}.`
    },
    onDragEnd: ({ active, over }) => {
      if (!over) return ''
      const overId = String(over.id)
      const isColumn = columns.some((c) => c.id === overId)
      return isColumn
        ? `Soltou a tarefa ${titleOf(active.id)} na coluna ${columnNameOf(overId)}.`
        : `Soltou a tarefa ${titleOf(active.id)} sobre ${titleOf(overId)}.`
    },
    onDragCancel: ({ active }) =>
      `Movimento cancelado. A tarefa ${titleOf(active.id)} voltou para o lugar.`,
  }

  const screenReaderInstructions = {
    draggable:
      'Para mover uma tarefa: foque nela, pressione Espaço ou Enter para pegá-las, use as setas para escolher a posição e Espaço ou Enter para soltar. Pressione Escape para cancelar. Como alternativa, use o seletor "Mover para" em cada tarefa.',
  }

  const onDragEnd = ({ active, over }) => {
    setDragTaskId(null)
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    let toColumnId
    let toIndex
    if (columns.some((c) => c.id === overId)) {
      // Soltou sobre a coluna: vai para o fim da coluna de destino.
      toColumnId = overId
      toIndex = tasks.filter((t) => t.columnId === toColumnId && t.id !== activeId).length
    } else {
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask) return
      // Soltou sobre outro cartão: insere na posição dele (sem a tarefa arrastada).
      toColumnId = overTask.columnId
      const list = tasks
        .filter((t) => t.columnId === toColumnId && t.id !== activeId)
        .sort((a, b) => a.order - b.order)
      const index = list.findIndex((t) => t.id === overId)
      toIndex = index === -1 ? list.length : index
    }
    moveTask(activeId, toColumnId, toIndex)
  }

  const removeColumnCount = columnToDelete
    ? tasks.filter((t) => t.columnId === columnToDelete.id).length
    : 0

  return (
    <section className="tasks-page">
      <div className="tasks-header">
        <h1>Tarefas</h1>
        <div className="tasks-header-actions">
          <button type="button" className="button-primary" onClick={openCreateTask}>
            Nova tarefa
          </button>
          <button type="button" onClick={openCreateColumn}>
            Nova coluna
          </button>
        </div>
      </div>

      <p className="hint" role="status">
        {visibleTasks.length} {visibleTasks.length === 1 ? 'tarefa' : 'tarefas'}
        {filtersActive && ` de ${tasks.length}`}
      </p>

      <div className="kb-filters">
        <div className="field">
          <label htmlFor="kb-filter-notebook">Caderno</label>
          <select
            id="kb-filter-notebook"
            value={filterNotebook}
            onChange={(e) => setFilterNotebook(e.target.value)}
          >
            <option value="">Todos</option>
            {notebooks.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="kb-filter-priority">Prioridade</label>
          <select
            id="kb-filter-priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="kb-filter-search">Buscar</label>
          <input
            id="kb-filter-search"
            type="search"
            value={query}
            placeholder="Título da tarefa"
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        announcements={announcements}
        screenReaderInstructions={screenReaderInstructions}
        onDragStart={({ active }) => setDragTaskId(String(active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragTaskId(null)}
      >
        <div className="kb-board">
          {sortedColumns.map((column) => {
            const columnTasks = visibleTasks
              .filter((t) => t.columnId === column.id)
              .sort((a, b) => a.order - b.order)
            const totalInColumn = tasks.filter((t) => t.columnId === column.id).length
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                totalInColumn={totalInColumn}
                columns={sortedColumns}
                notebookNameOf={notebookNameOf}
                canRemove={sortedColumns.length > 1}
                onEdit={() => openEditColumn(column)}
                onRemove={() => setColumnToDelete(column)}
                onEditTask={openEditTask}
                onRemoveTask={setTaskToDelete}
                onMoveTask={(taskId, toColumnId) => moveTask(taskId, toColumnId, 0)}
                emptyMessage={
                  filtersActive ? 'Nenhuma tarefa com esses filtros.' : 'Nenhuma tarefa ainda.'
                }
              />
            )
          })}
        </div>

        <DragOverlay>
          {dragTask && (
            <div className="kb-card kb-card-overlay" aria-hidden="true">
              <TaskContent
                task={dragTask}
                notebookName={notebookNameOf(dragTask)}
                done={isDoneTask(dragTask, columns)}
                columns={sortedColumns}
                interactive={false}
                onEdit={() => {}}
                onDelete={() => {}}
                onMove={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskForm
        open={taskFormOpen}
        initial={editingTask ?? undefined}
        onClose={() => {
          setTaskFormOpen(false)
          setEditingTask(null)
        }}
        onSubmit={onTaskSubmit}
      />

      <ColumnForm
        open={columnFormOpen}
        initial={editingColumn ?? undefined}
        onClose={() => {
          setColumnFormOpen(false)
          setEditingColumn(null)
        }}
        onSubmit={onColumnSubmit}
      />

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        danger
        title="Excluir tarefa?"
        message={`Excluir a tarefa “${taskToDelete?.title ?? ''}”? Sessões de foco já feitas ficam no histórico, sem vínculo.`}
        confirmLabel="Sim, excluir"
        onConfirm={() => {
          removeTask(taskToDelete.id)
          setTaskToDelete(null)
        }}
        onCancel={() => setTaskToDelete(null)}
      />

      <ConfirmDialog
        open={Boolean(columnToDelete)}
        danger
        title="Remover coluna?"
        message={
          removeColumnCount > 0
            ? `Remover a coluna “${columnToDelete?.name ?? ''}”? ${removeColumnCount} ${
                removeColumnCount === 1 ? 'tarefa será apagada' : 'tarefas serão apagadas'
              }.`
            : `Remover a coluna “${columnToDelete?.name ?? ''}”? Ela não tem tarefas.`
        }
        confirmLabel="Sim, remover"
        onConfirm={() => {
          removeColumn(columnToDelete.id)
          setColumnToDelete(null)
        }}
        onCancel={() => setColumnToDelete(null)}
      />
    </section>
  )
}
