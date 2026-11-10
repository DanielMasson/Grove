import { MAX_MINUTES, MIN_MINUTES } from './useTimer'

const PRESETS = [15, 25, 45, 60, 120]

export default function DurationPicker({ value, onChange, error }) {
  const selected = Number(value)
  const errorId = 'duration-error'

  return (
    <fieldset className="pickers-fieldset">
      <legend>Duração da sessão</legend>
      <div className="duration-presets" role="group" aria-label="Durações prontas">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            className={selected === m && !error ? 'preset active' : 'preset'}
            aria-pressed={selected === m && !error}
            onClick={() => onChange(String(m))}
          >
            {m} min
          </button>
        ))}
      </div>
      <div className="duration-custom">
        <label htmlFor="duration-input">Ou digite outro valor ({MIN_MINUTES} a {MAX_MINUTES})</label>
        <input
          id="duration-input"
          type="number"
          inputMode="numeric"
          min={MIN_MINUTES}
          max={MAX_MINUTES}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
