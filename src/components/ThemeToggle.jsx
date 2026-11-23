import { useLayoutEffect } from 'react'
import { useStore } from '../store/useStore'
import './theme-toggle.css'

const OPTIONS = [
  ['system', 'Sistema'],
  ['light', 'Claro'],
  ['dark', 'Escuro'],
]

/**
 * Aplica o tema no <html>: "light"/"dark" forçam; "system" remove o atributo e deixa o
 * prefers-color-scheme decidir (ver tokens.css).
 * @param {import('../types.js').Settings['theme']} theme
 */
export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme
  else delete root.dataset.theme
}

/** Seletor "Tema: Sistema / Claro / Escuro", gravado em `settings.theme`. */
export default function ThemeToggle() {
  const theme = useStore((s) => s.settings.theme)
  const updateSettings = useStore((s) => s.updateSettings)

  // Layout effect: o atributo entra antes da pintura (menos "piscada") e antes dos efeitos
  // passivos de quem lê os tokens depois (FocusChart).
  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <div className="theme-toggle">
      <label htmlFor="theme-select">Tema</label>
      <select id="theme-select" value={theme} onChange={(e) => updateSettings({ theme: e.target.value })}>
        {OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
