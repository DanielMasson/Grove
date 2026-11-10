import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { formatMinutes } from './statsData'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// Chart.js desenha em canvas e não entende var(--x): lê o valor calculado do token.
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/**
 * @param {{ data: { label: string, minutes: number }[], horizontal?: boolean, ariaLabel: string }} props
 */
export default function FocusChart({ data, horizontal = false, ariaLabel }) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.label),
      datasets: [
        { label: 'Minutos de foco', data: data.map((d) => d.minutes), backgroundColor: token('--primary') },
      ],
    }),
    [data],
  )

  const minutesAxis = { beginAtZero: true, title: { display: true, text: 'Minutos', color: token('--text') }, ticks: { color: token('--text') }, grid: { color: token('--border') } }
  const labelAxis = { ticks: { color: token('--text') }, grid: { display: false } }

  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    animation: reduceMotion ? false : undefined,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => formatMinutes(horizontal ? ctx.parsed.x : ctx.parsed.y) } },
    },
    scales: horizontal ? { x: minutesAxis, y: labelAxis } : { x: labelAxis, y: minutesAxis },
  }

  const height = horizontal ? Math.max(200, data.length * 36 + 60) : 300

  return (
    <div className="stats-chart" style={{ height }}>
      <Bar data={chartData} options={options} role="img" aria-label={ariaLabel} />
    </div>
  )
}
