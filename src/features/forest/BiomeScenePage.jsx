import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { BIOMES, GROWTH_STAGES, MAX_STAGES } from '../../biomes/config'
import TreeSvg from '../../biomes/trees/TreeSvg'
import { ForestNav } from './ForestPage'
import { treesOfBiome } from './forestStats'
import './forest.css'

const BATCH = 24

const stageText = (stages) =>
  GROWTH_STAGES[Math.min(MAX_STAGES, Math.max(1, stages)) - 1]

const formatDate = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR')
}

export default function BiomeScenePage() {
  const { biome: biomeParam } = useParams()
  const trees = useStore((s) => s.trees)
  const notebooks = useStore((s) => s.notebooks)
  const [visible, setVisible] = useState(BATCH)

  const valid = Object.hasOwn(BIOMES, biomeParam)
  const list = useMemo(() => (valid ? treesOfBiome(trees, biomeParam) : []), [trees, biomeParam, valid])

  if (!valid) {
    return (
      <section className="forest-page">
        <h1>Bioma não encontrado</h1>
        <Link to="/floresta">Voltar para a floresta</Link>
      </section>
    )
  }

  const biome = BIOMES[biomeParam]
  const shown = list.slice(0, visible)

  return (
    <section className="forest-page">
      <h1>{biome.name}</h1>
      <ForestNav />

      {list.length === 0 ? (
        <p className="hint forest-empty">
          Ainda não há árvores aqui. <Link to="/foco">Foque para plantar a primeira.</Link>
        </p>
      ) : (
        <>
          <p className="hint" role="status">
            {list.length} {list.length === 1 ? 'árvore' : 'árvores'}
          </p>
          <ul className="forest-grid">
            {shown.map((t) => {
              const species = biome.species.find((sp) => sp.id === t.species)
              const notebookName = notebooks.find((n) => n.id === t.notebookId)?.name ?? 'Sem caderno'
              return (
                <li key={t.id}>
                  <figure className="forest-figure">
                    <TreeSvg biome={t.biome} species={t.species} stage={t.stages} progress={0} />
                    <figcaption>
                      <strong>{species?.name ?? t.species}</strong>
                      <span>
                        {stageText(t.stages)} ({t.stages} de {MAX_STAGES})
                      </span>
                      <span>Plantada em {formatDate(t.plantedAt)}</span>
                      <span>{notebookName}</span>
                    </figcaption>
                  </figure>
                </li>
              )
            })}
          </ul>
          {visible < list.length && (
            <button type="button" className="forest-more" onClick={() => setVisible((v) => v + BATCH)}>
              Mostrar mais
            </button>
          )}
        </>
      )}
    </section>
  )
}
