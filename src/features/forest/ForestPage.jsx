import { Link, NavLink } from 'react-router-dom'
import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { BIOMES } from '../../biomes/config'
import BiomeSummaryCard from './BiomeSummaryCard'
import { summarizeByBiome } from './forestStats'
import './forest.css'

export function ForestNav() {
  return (
    <nav className="forest-nav" aria-label="Biomas da floresta">
      <NavLink to="/floresta" end>
        Resumo
      </NavLink>
      {Object.values(BIOMES).map((b) => (
        <NavLink key={b.id} to={`/floresta/${b.id}`}>
          {b.name}
        </NavLink>
      ))}
    </nav>
  )
}

export default function ForestPage() {
  const trees = useStore((s) => s.trees)
  const sessions = useStore((s) => s.sessions)
  const summary = useMemo(() => summarizeByBiome(trees, sessions), [trees, sessions])

  return (
    <section className="forest-page">
      <h1>Floresta</h1>
      <ForestNav />

      {trees.length === 0 && (
        <p className="hint forest-empty">
          Sua floresta ainda está vazia. <Link to="/foco">Comece uma sessão de foco</Link> para plantar a
          primeira árvore.
        </p>
      )}

      <ul className="forest-grid-cards">
        {Object.keys(BIOMES).map((id) => (
          <BiomeSummaryCard key={id} biomeId={id} summary={summary[id]} />
        ))}
      </ul>
    </section>
  )
}
