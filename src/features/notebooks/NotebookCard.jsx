import { Link } from 'react-router-dom'
import { BIOMES } from '../../biomes/config'

/**
 * Card de um caderno na grade: identidade (nome + bioma), números e ações.
 * @param {{
 *   notebook: import('../../types.js').Notebook,
 *   focusMinutes: number,
 *   treeCount: number,
 *   matchedSource?: import('../../types.js').Source | null,
 * }} props
 */
export default function NotebookCard({ notebook, focusMinutes, treeCount, matchedSource }) {
  const biome = BIOMES[notebook.biome]

  return (
    <li className="nb-card">
      <div className="nb-card-head">
        <span
          className="biome-swatch"
          aria-hidden="true"
          style={{ '--biome-sky': biome.colors.sky, '--biome-ground': biome.colors.ground }}
        />
        <h2 className="nb-card-title">{notebook.name}</h2>
      </div>

      <p className="nb-card-biome">
        Bioma: <strong>{biome.name}</strong>
      </p>

      <ul className="nb-card-stats">
        <li>
          {notebook.sources.length} {notebook.sources.length === 1 ? 'fonte' : 'fontes'}
        </li>
        <li>{focusMinutes} min de foco</li>
        <li>
          {treeCount} {treeCount === 1 ? 'árvore' : 'árvores'}
        </li>
      </ul>

      {matchedSource && (
        <p className="nb-card-source hint">
          Fonte encontrada:{' '}
          <strong>{matchedSource.title || matchedSource.url || matchedSource.text || 'Sem título'}</strong>
        </p>
      )}

      <div className="nb-actions">
        <Link
          className="nb-open"
          to={`/cadernos/${notebook.id}`}
          aria-label={`Abrir caderno ${notebook.name}`}
        >
          Abrir
        </Link>
        <Link
          className="nb-focus"
          to={{ pathname: '/foco', search: `?notebookId=${notebook.id}` }}
          aria-label={`Focar no caderno ${notebook.name}`}
        >
          Focar
        </Link>
      </div>
    </li>
  )
}
