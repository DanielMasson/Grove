import { BIOMES } from '../../biomes/config'

export default function SpeciesPicker({ biome, species, onChange, locked, lockReason }) {
  const options = BIOMES[biome].species
  const biomeName = BIOMES[biome].name

  return (
    <div>
      <fieldset
        className="pickers-fieldset"
        disabled={locked}
        aria-describedby={locked && lockReason ? 'species-lock-hint' : undefined}
      >
        <legend>Espécie ({biomeName})</legend>
        <div className="species-grid">
          {options.map((sp) => (
            <label key={sp.id} className={species === sp.id ? 'species-card active' : 'species-card'}>
              <input
                type="radio"
                name="species"
                value={sp.id}
                checked={species === sp.id}
                onChange={() => onChange(sp.id)}
              />
              <span className="species-emoji" aria-hidden="true">
                {sp.emoji}
              </span>
              <span>{sp.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {locked && lockReason && (
        <p id="species-lock-hint" className="hint">
          {lockReason}
        </p>
      )}
    </div>
  )
}
