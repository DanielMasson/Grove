import { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'
import { GOAL_MAX, GOAL_MIN, GOAL_STEP, minutesToday, parseGoal } from './dailyGoal'

/** Campo "Meta de hoje (min)" e barra de progresso do dia. Só aparece no Foco ocioso. */
export default function DailyGoalCard() {
  const goal = useStore((s) => s.settings.dailyGoalMinutes)
  const sessions = useStore((s) => s.sessions)
  const updateSettings = useStore((s) => s.updateSettings)
  const [text, setText] = useState(goal == null ? '' : String(goal))
  const [error, setError] = useState('')

  // Mantém o campo em sincronia se a meta mudar por fora (importar backup, apagar tudo).
  useEffect(() => {
    setText((t) => (parseGoal(t).value === goal ? t : goal == null ? '' : String(goal)))
  }, [goal])

  // Re-render a cada minuto: na virada do dia a barra zera sem recarregar.
  const [, setNow] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const done = minutesToday(sessions)

  const onChange = (e) => {
    const value = e.target.value
    setText(value)
    const parsed = parseGoal(value)
    if (parsed.error) {
      setError(parsed.error)
      return
    }
    setError('')
    updateSettings({ dailyGoalMinutes: parsed.value })
  }

  return (
    <fieldset className="pickers-fieldset">
      <legend>Meta de hoje</legend>
      <div className="duration-custom">
        <label htmlFor="goal-input">
          Meta de hoje (min) — {GOAL_MIN} a {GOAL_MAX}, vazio = sem meta
        </label>
        <input
          id="goal-input"
          type="number"
          inputMode="numeric"
          min={GOAL_MIN}
          max={GOAL_MAX}
          step={GOAL_STEP}
          value={text}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'goal-error' : undefined}
        />
      </div>
      {error && (
        <p id="goal-error" className="field-error" role="alert">
          {error}
        </p>
      )}
      {goal != null && (
        <div className="goal-progress">
          <progress
            max={goal}
            value={Math.min(done, goal)}
            aria-label={`Progresso da meta de hoje: ${done} de ${goal} minutos`}
          />
          <p className="hint" role="status">
            Hoje: {done} de {goal} min
            {done >= goal && ' · Meta de hoje concluída 🌳'}
          </p>
        </div>
      )}
    </fieldset>
  )
}
