import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import FocusChart from './FocusChart'
import StatsTable from './StatsTable'
import {
  formatMinutes,
  minutesByNotebook,
  minutesByTask,
  minutesPerDay,
  minutesPerMonth,
  minutesPerWeek,
} from './statsData'
import './stats.css'

const VIEWS = [
  { id: 'dia', label: 'Dia', title: 'Foco por dia nos últimos 14 dias', column: 'Dia' },
  { id: 'semana', label: 'Semana', title: 'Foco por semana nas últimas 8 semanas (início na segunda)', column: 'Semana (segunda-feira)' },
  { id: 'mes', label: 'Mês', title: 'Foco por mês nos últimos 12 meses', column: 'Mês' },
  { id: 'caderno', label: 'Caderno', title: 'Foco por caderno', column: 'Caderno', horizontal: true },
  { id: 'tarefa', label: 'Tarefa', title: 'Foco por tarefa (10 maiores)', column: 'Tarefa', horizontal: true },
]

export default function StatsPage() {
  const sessions = useStore((s) => s.sessions)
  const notebooks = useStore((s) => s.notebooks)
  const tasks = useStore((s) => s.tasks)
  const [viewId, setViewId] = useState('dia')
  const view = VIEWS.find((v) => v.id === viewId)

  const rows = useMemo(() => {
    switch (viewId) {
      case 'semana': return minutesPerWeek(sessions, 8)
      case 'mes': return minutesPerMonth(sessions, 12)
      case 'caderno': return minutesByNotebook(sessions, notebooks)
      case 'tarefa': return minutesByTask(sessions, tasks, 10)
      default: return minutesPerDay(sessions, 14)
    }
  }, [viewId, sessions, notebooks, tasks])

  const total = rows.reduce((sum, r) => sum + r.minutes, 0)

  if (sessions.length === 0) {
    return (
      <section className="stats-page">
        <h1>Gráficos</h1>
        <p className="hint">
          Conclua uma sessão de foco para ver seus gráficos. <Link to="/foco">Ir para o Foco</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="stats-page">
      <h1>Gráficos</h1>

      <div className="stats-views" role="group" aria-label="Visão dos gráficos">
        {VIEWS.map((v) => (
          <button key={v.id} type="button" aria-pressed={v.id === viewId} className={v.id === viewId ? 'preset active' : 'preset'} onClick={() => setViewId(v.id)}>
            {v.label}
          </button>
        ))}
      </div>

      <h2 className="stats-title">{view.title}</h2>
      <p className="hint" role="status">
        {total > 0 ? `Total: ${formatMinutes(total)}` : 'Nenhum foco neste período.'}
      </p>

      {rows.length > 0 && (
        <FocusChart
          data={rows}
          horizontal={view.horizontal}
          ariaLabel={`${view.title}: total de ${formatMinutes(total)}. Os mesmos dados estão na tabela abaixo.`}
        />
      )}
      {rows.length === 0 && <p className="hint">Sem dados para esta visão.</p>}

      <StatsTable caption={view.title} columnLabel={view.column} rows={rows} />
    </section>
  )
}
