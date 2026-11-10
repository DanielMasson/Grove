import { Link } from 'react-router-dom'
import { BIOMES } from '../../biomes/config'

/**
 * Card-resumo de um bioma.
 * @param {{
 *   biomeId: import('../../types.js').BiomeId,
 *   summary: { trees: number, adults: number, minutes: number },
 * }} props
 */
export default function BiomeSummaryCard({ biomeId, summary }) {
  const biome = BIOMES[biomeId]
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

  return (
    <li className="forest-card">
      <div className="forest-card-head">
        <span
          className="forest-swatch"
          aria-hidden="true"
          style={{ '--biome-sky': biome.colors.sky, '--biome-ground': biome.colors.ground }}
        />
        <h2 className="forest-card-title">{biome.name}</h2>
      </div>
      <ul className="forest-card-stats">
        <li>{plural(summary.trees, 'árvore', 'árvores')}</li>
        <li>{plural(summary.adults, 'adulta', 'adultas')}</li>
        <li>{summary.minutes} min de foco</li>
      </ul>
      <Link
        className="forest-open"
        to={`/floresta/${biome.id}`}
        aria-label={`Ver o bioma ${biome.name}`}
      >
        Ver bioma
      </Link>
    </li>
  )
}
