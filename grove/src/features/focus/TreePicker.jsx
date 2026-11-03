import { useStore } from '../../store/useStore'
import { BIOMES, GROWTH_STAGES, MAX_STAGES } from '../../biomes/config'

// Árvores no estágio 4 já estão adultas: não aparecem para evoluir.
export default function TreePicker({ value, onChange, disabled }) {
  const trees = useStore((s) => s.trees)
  const evolvable = trees.filter((t) => t.stages < MAX_STAGES)

  return (
    <fieldset className="pickers-fieldset" disabled={disabled}>
      <legend>Árvore</legend>
      <div className="tree-options">
        <label className={value === 'new' ? 'tree-option active' : 'tree-option'}>
          <input type="radio" name="tree" value="new" checked={value === 'new'} onChange={() => onChange('new')} />
          <span className="tree-option-title">🌱 Plantar uma árvore nova</span>
          <span className="hint">Nasce do zero, com os estágios desta sessão.</span>
        </label>

        {evolvable.map((t) => {
          const species = BIOMES[t.biome].species.find((sp) => sp.id === t.species)
          return (
            <label key={t.id} className={value === t.id ? 'tree-option active' : 'tree-option'}>
              <input type="radio" name="tree" value={t.id} checked={value === t.id} onChange={() => onChange(t.id)} />
              <span className="tree-option-title">
                {species?.emoji} {species?.name ?? t.species} · {BIOMES[t.biome].name}
              </span>
              <span className="hint">
                Estágio {t.stages} de {MAX_STAGES} ({GROWTH_STAGES[t.stages - 1]})
              </span>
            </label>
          )
        })}

        {evolvable.length === 0 && trees.length > 0 && (
          <p className="hint">Todas as suas árvores já estão adultas (estágio {MAX_STAGES}).</p>
        )}
      </div>
    </fieldset>
  )
}
