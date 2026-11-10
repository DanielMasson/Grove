import { BIOMES } from '../../biomes/config'

/**
 * Cartões-rádio para escolher o bioma de um caderno. Navegável por teclado
 * (o agrupamento vem de <fieldset>/<legend>).
 * @param {{
 *   value: import('../../types.js').BiomeId,
 *   onChange: (id: import('../../types.js').BiomeId) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function BiomePicker({ value, onChange, disabled }) {
  return (
    <fieldset className="biome-picker">
      <legend>Bioma</legend>
      <div className="biome-grid">
        {Object.values(BIOMES).map((b) => (
          <label key={b.id} className={`biome-card${value === b.id ? ' active' : ''}`}>
            <input
              type="radio"
              name="notebook-biome"
              value={b.id}
              checked={value === b.id}
              disabled={disabled}
              onChange={() => onChange(b.id)}
            />
            <span
              className="biome-swatch"
              aria-hidden="true"
              style={{ '--biome-sky': b.colors.sky, '--biome-ground': b.colors.ground }}
            />
            <span className="biome-card-text">
              <span className="biome-card-name">{b.name}</span>
              <span className="biome-card-species hint">
                {b.species.map((s) => `${s.emoji} ${s.name}`).join(' · ')}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
