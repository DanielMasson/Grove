import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTimer } from '../focus/useTimer'
import { BIOMES } from '../../biomes/config'
import NotebookForm from './NotebookForm'
import ConfirmDialog from '../../components/ConfirmDialog'
import './notebooks.css'

export default function NotebookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notebook = useStore((s) => s.notebooks.find((n) => n.id === id))
  const tasks = useStore((s) => s.tasks)
  const sessions = useStore((s) => s.sessions)
  const updateNotebook = useStore((s) => s.updateNotebook)
  const removeNotebook = useStore((s) => s.removeNotebook)

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  if (!notebook) {
    return (
      <section className="notebooks-page">
        <h1>Caderno não encontrado</h1>
        <Link to="/cadernos">Voltar para a lista</Link>
      </section>
    )
  }

  const biome = BIOMES[notebook.biome]
  const taskCount = tasks.filter((t) => t.notebookId === id).length
  const sessionCount = sessions.filter((x) => x.notebookId === id).length

  const onDeleteClick = () => {
    // Sessão ativa ligada a este caderno (direto ou pela tarefa): bloquear exclusão.
    const timer = useTimer.getState()
    const linkedTask = timer.taskId ? tasks.find((t) => t.id === timer.taskId) : undefined
    const activeLinked =
      timer.active && (timer.notebookId === id || linkedTask?.notebookId === id)
    if (activeLinked) {
      setDeleteError('Termine ou desista da sessão de foco antes de excluir este caderno.')
      return
    }
    setDeleteError('')
    setConfirmDelete(true)
  }

  const confirmDeleteNow = () => {
    removeNotebook(id)
    setConfirmDelete(false)
    navigate('/cadernos')
  }

  return (
    <section className="notebooks-page nb-detail">
      <div className="nb-header">
        <div className="nb-detail-title">
          <span
            className="biome-swatch"
            aria-hidden="true"
            style={{ '--biome-sky': biome.colors.sky, '--biome-ground': biome.colors.ground }}
          />
          <h1>{notebook.name}</h1>
        </div>
        <div className="nb-detail-actions">
          <button type="button" onClick={() => setEditOpen(true)}>
            Editar
          </button>
          <button type="button" className="button-danger" onClick={onDeleteClick}>
            Excluir
          </button>
        </div>
      </div>

      <p className="nb-card-biome">
        Bioma: <strong>{biome.name}</strong> · {taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'} ·{' '}
        {sessionCount} {sessionCount === 1 ? 'sessão' : 'sessões'} de foco
      </p>
      {deleteError && (
        <p className="field-error" role="alert">
          {deleteError}
        </p>
      )}

      <h2>Fontes</h2>
      <p className="hint">Nenhuma fonte ainda.</p>

      <NotebookForm
        open={editOpen}
        initial={notebook}
        onSubmit={({ name, biome: newBiome }) => {
          updateNotebook(id, { name, biome: newBiome })
          setEditOpen(false)
        }}
        onClose={() => setEditOpen(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Excluir caderno?"
        message={`Excluir ${notebook.name}? Isso apaga ${taskCount} ${
          taskCount === 1 ? 'tarefa' : 'tarefas'
        } e mantém ${sessionCount} ${sessionCount === 1 ? 'sessão' : 'sessões'} de foco no histórico, sem vínculo.`}
        confirmLabel="Sim, excluir"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  )
}
