import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function NotebookDetailPage() {
  const { id } = useParams()
  const notebook = useStore((s) => s.notebooks.find((n) => n.id === id))
  if (!notebook) {
    return (
      <section>
        <h1>Caderno não encontrado</h1>
        <Link to="/cadernos">Voltar para a lista</Link>
      </section>
    )
  }
  return (
    <section>
      <h1>{notebook.name}</h1>
      {/* TODO (Cadernos): fontes, tags, busca */}
    </section>
  )
}
