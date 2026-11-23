import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { useStore } from '../../store/useStore'
import { formatMinutes } from './statsData'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const DARK_QUERY = '(prefers-color-scheme: dark)'

// Chart.js desenha em canvas e não entende var(--x): lê o valor calculado do token.
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const readColors = () => ({ primary: token('--primary'), text: token('--text'), border: token('--border') })

/**
 * @param {{ data: { label: string, minutes: number }[], horizontal?: boolean, ariaLabel: string }} props
 */
export default function FocusChart({ data, horizontal = false, ariaLabel }) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // As cores dependem do tema. `theme` (escolha do usuário) e `systemDark` (SO, usado quando a
  // escolha é "Sistema") entram como dependência: ao mudar qualquer um, os tokens são relidos.
  const theme = useStore((s) => s.settings.theme)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.(DARK_QUERY).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY)
    if (!mq) return undefined
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const [colors, setColors] = useState(readColors)
  // Efeito (e não leitura durante o render): roda depois de o ThemeToggle aplicar data-theme.
  useEffect(() => {
    const next = readColors()
    setColors((prev) =>
      prev.primary === next.primary && prev.text === next.text && prev.border === next.border ? prev : next,
    )
  }, [theme, systemDark])

  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.label),
      datasets: [{ label: 'Minutos de foco', data: data.map((d) => d.minutes), backgroundColor: colors.primary }],
    }),
    [data, colors],
  )

  const options = useMemo(() => {
    const minutesAxis = {
      beginAtZero: true,
      title: { display: true, text: 'Minutos', color: colors.text },
      ticks: { color: colors.text },
      grid: { color: colors.border },
    }
    const labelAxis = { ticks: { color: colors.text }, grid: { display: false } }
    return {
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
  }, [colors, horizontal, reduceMotion])

  const height = horizontal ? Math.max(200, data.length * 36 + 60) : 300

  return (
    <div className="stats-chart" style={{ height }}>
      <Bar data={chartData} options={options} role="img" aria-label={ariaLabel} />
    </div>
  )
}
