import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useTimer } from '../focus/useTimer'
import { BIOMES } from '../../biomes/config'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { allTags, filterSources } from '../../lib/sources'
import NotebookForm from './NotebookForm'
import SourceForm from './SourceForm'
import SourceCard from './SourceCard'
import ConfirmDialog from '../../components/ConfirmDialog'
import './notebooks.css'
import './sources.css'

export default function NotebookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notebook = useStore((s) => s.notebooks.find((n) => n.id === id))
  const tasks = useStore((s) => s.tasks)
  const sessions = useStore((s) => s.sessions)
  const updateNotebook = useStore((s) => s.updateNotebook)
  const removeNotebook = useStore((s) => s.removeNotebook)
  const addSource = useStore((s) => s.addSource)
  const updateSource = useStore((s) => s.updateSource)
  const removeSource = useStore((s) => s.removeSource)

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Fontes: busca, filtro por tags e formulários.
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [selectedTags, setSelectedTags] = useState([])
  const [sourceFormOpen, setSourceFormOpen] = useState(false)
  const [editingSource, setEditingSource] = useState(null)
  const [sourceToRemove, setSourceToRemove] = useState(null)

  const sources = useMemo(() => notebook?.sources ?? [], [notebook])
  const tags = useMemo(() => allTags(sources), [sources])
  // Tags que sumiram (fonte removida/editada) saem da seleção.
  const activeTags = selectedTags.filter((t) => tags.includes(t))
  const shown = useMemo(
    () => filterSources(sources, debouncedQuery, activeTags),
    [sources, debouncedQuery, activeTags],
  )
  const filtering = debouncedQuery.trim().length > 0 || activeTags.length > 0

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

  const openAddSource = () => {
    setEditingSource(null)
    setSourceFormOpen(true)
  }
  const openEditSource = (source) => {
    setEditingSource(source)
    setSourceFormOpen(true)
  }
  const closeSourceForm = () => {
    setSourceFormOpen(false)
    setEditingSource(null)
  }

  // O store valida a URL e pode lançar; o SourceForm mostra o erro junto ao campo.
  const onSourceSubmit = (data) => {
    if (editingSource) {
      const { type, ...patch } = data
      updateSource(id, editingSource.id, patch)
    } else {
      addSource(id, data)
    }
    closeSourceForm()
  }

  const toggleTag = (tag) =>
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))

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

      <div className="src-toolbar">
        {sources.length > 0 && (
          <div className="field">
            <label htmlFor="src-search">Buscar nas fontes</label>
            <input
              id="src-search"
              type="search"
              value={query}
              placeholder="Título, link, texto ou tag"
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
        <button type="button" className="button-primary src-add" onClick={openAddSource}>
          Adicionar fonte
        </button>
      </div>

      {tags.length > 0 && (
        <ul className="src-filter" aria-label="Filtrar por tags">
          {tags.map((t) => (
            <li key={t}>
              <button type="button" aria-pressed={activeTags.includes(t)} onClick={() => toggleTag(t)}>
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}

      {sources.length === 0 ? (
        <p className="hint">Nenhuma fonte ainda. Adicione links, vídeos do YouTube ou notas.</p>
      ) : (
        <>
          {filtering && (
            <p className="hint" role="status">
              {shown.length === 0
                ? `Nada encontrado${debouncedQuery.trim() ? ` para “${debouncedQuery.trim()}”` : ''}.`
                : `${shown.length} ${shown.length === 1 ? 'resultado' : 'resultados'}`}
            </p>
          )}
          <ul className="src-list">
            {shown.map((s) => (
              <SourceCard
                key={s.id}
                source={s}
                onEdit={() => openEditSource(s)}
                onRemove={() => setSourceToRemove(s)}
              />
            ))}
          </ul>
        </>
      )}

      <NotebookForm
        open={editOpen}
        initial={notebook}
        onSubmit={({ name, biome: newBiome }) => {
          updateNotebook(id, { name, biome: newBiome })
          setEditOpen(false)
        }}
        onClose={() => setEditOpen(false)}
      />

      <SourceForm
        open={sourceFormOpen}
        initial={editingSource ?? undefined}
        onSubmit={onSourceSubmit}
        onClose={closeSourceForm}
      />

      <ConfirmDialog
        open={Boolean(sourceToRemove)}
        danger
        title="Remover fonte?"
        message={`Remover a fonte “${sourceToRemove?.title || sourceToRemove?.url || 'sem título'}”?`}
        confirmLabel="Sim, remover"
        onConfirm={() => {
          removeSource(id, sourceToRemove.id)
          setSourceToRemove(null)
        }}
        onCancel={() => setSourceToRemove(null)}
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
