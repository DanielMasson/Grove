import { HashRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom'
import FocusPage from './features/focus/FocusPage'
import ForestPage from './features/forest/ForestPage'
import StatsPage from './features/stats/StatsPage'
import TasksPage from './features/tasks/TasksPage'
import NotebooksPage from './features/notebooks/NotebooksPage'
import BackupButtons from './components/BackupButtons'
import { useTimer } from './features/focus/useTimer'
import { useSessionWatcher } from './features/focus/useSessionWatcher'
import { useEffect } from 'react'

const links = [
  ['/foco', 'Foco'],
  ['/floresta', 'Floresta'],
  ['/graficos', 'Gráficos'],
  ['/tarefas', 'Tarefas'],
  ['/cadernos', 'Cadernos'],
]

export default function App() {
  const active = useTimer((s) => s.active)

  // Conclui a sessão mesmo se o usuário estiver em outra tela (spec 01, seção 3).
  useSessionWatcher()

  // Avisa antes de fechar a aba: fechar mata a sessão e a árvore.
  useEffect(() => {
    if (!active) return
    const h = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [active])

  // HashRouter: funciona no GitHub Pages sem configuração extra.
  return (
    <HashRouter>
      <header className="topbar">
        <strong className="logo">🌳 Grove</strong>
        <nav aria-label="Navegação principal">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {to === '/foco' && active && (
                <span className="nav-seed" aria-hidden="true">
                  🌱
                </span>
              )}
              {label}
              {to === '/foco' && active && <span className="sr-only"> (sessão em andamento)</span>}
            </NavLink>
          ))}
        </nav>
        <BackupButtons />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/foco" replace />} />
          <Route path="/foco" element={<FocusPage />} />
          <Route path="/floresta" element={<ForestPage />} />
          <Route path="/graficos" element={<StatsPage />} />
          <Route path="/tarefas" element={<TasksPage />} />
          <Route path="/cadernos" element={<NotebooksPage />} />
          <Route path="*" element={<Navigate to="/foco" replace />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
