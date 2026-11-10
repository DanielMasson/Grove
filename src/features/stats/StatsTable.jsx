import { formatMinutes } from './statsData'

/** Tabela com os mesmos dados do gráfico (alternativa acessível). */
export default function StatsTable({ caption, columnLabel, rows }) {
  return (
    <table className="stats-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{columnLabel}</th>
          <th scope="col">Tempo de foco</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key ?? r.id ?? r.label}>
            <th scope="row">{r.label}</th>
            <td>{formatMinutes(r.minutes)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
