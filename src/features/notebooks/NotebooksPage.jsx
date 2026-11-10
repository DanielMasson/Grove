import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { searchNotebooks } from '../../lib/search'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import NotebookCard from './NotebookCard'
import NotebookForm from './NotebookForm'
import './notebooks.css'

export default function NotebooksPage() {
  const notebooks = useStore((s) => s.notebooks)
  const sessions = useStore((s) => s.sessions)
  const trees = useStore((s) => s.trees)
  const addNotebook = useStore((s) => s.addNotebook)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const debouncedQuery = useDebouncedValue(query)

  const stats = useMemo(() => {
    /** @type {Record<string, { minutes: number, trees: number }>} */
    const map = {}
    for (const n of notebooks) map[n.id] = { minutes: 0, trees: 0 }
    for (const s of sessions) if (map[s.notebookId]) map[s.notebookId].minutes += s.minutes
    for (const t of trees) if (map[t.notebookId]) map[t.notebookId].trees += 1
    return map
  }, [notebooks, sessions, trees])

  const results = useMemo(() => searchNotebooks(notebooks, debouncedQuery), [notebooks, debouncedQuery])
  const searching = debouncedQuery.trim().length > 0

  const onCreate = ({ name, biome }) => {
    const id = addNotebook({ name, biome })
    setFormOpen(false)
    navigate(`/cadernos/${id}`)
  }

  return (
    <section className="notebooks-page">
      <div className="nb-header">
        <h1>Cadernos</h1>
        <button type="button" className="button-primary" onClick={() => setFormOpen(true)}>
          Novo caderno
        </button>
      </div>

      {notebooks.length > 0 && (
        <div className="field nb-search">
          <label htmlFor="nb-search">Buscar</label>
          <input
            id="nb-search"
            type="search"
            value={query}
            placeholder="Nome do caderno ou fonte"
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {notebooks.length === 0 ? (
        <div className="nb-empty">
          <p>Crie seu primeiro caderno para começar a plantar.</p>
          <button type="button" className="button-primary" onClick={() => setFormOpen(true)}>
            Novo caderno
          </button>
        </div>
      ) : searching && results.length === 0 ? (
        <p className="hint nb-empty" role="status">
          Nada encontrado para “{debouncedQuery.trim()}”.
        </p>
      ) : (
        <>
          {searching && (
            <p className="hint" role="status">
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </p>
          )}
          <ul className="nb-grid">
            {results.map(({ notebook, matchedSource }) => (
              <NotebookCard
                key={notebook.id}
                notebook={notebook}
                focusMinutes={stats[notebook.id]?.minutes ?? 0}
                treeCount={stats[notebook.id]?.trees ?? 0}
                matchedSource={matchedSource}
              />
            ))}
          </ul>
        </>
      )}

      <NotebookForm open={formOpen} onSubmit={onCreate} onClose={() => setFormOpen(false)} />
    </section>
  )
}
