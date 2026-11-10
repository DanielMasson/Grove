import { safeHttpUrl } from '../../lib/url'
import { parseYouTubeId } from '../../lib/youtube'
import YouTubeEmbed from './YouTubeEmbed'

const TYPE_LABEL = { link: 'Link', youtube: 'Vídeo', note: 'Nota' }

/**
 * @param {{ source: import('../../types.js').Source, onEdit: () => void, onRemove: () => void }} props
 */
export default function SourceCard({ source, onEdit, onRemove }) {
  const title = source.title || source.url || 'Sem título'
  const href = source.type === 'note' ? null : safeHttpUrl(source.url)
  const videoId = source.type === 'youtube' ? parseYouTubeId(source.url ?? '') : null

  return (
    <li className="src-card">
      <div className="src-head">
        <span className="src-type">{TYPE_LABEL[source.type]}</span>
        <h3 className="src-title">{title}</h3>
      </div>

      {source.type === 'note' && <p className="src-note">{source.text}</p>}
      {videoId && <YouTubeEmbed id={videoId} title={title} />}
      {href && !videoId && (
        <a className="src-link" href={href} target="_blank" rel="noopener noreferrer">
          {href}
        </a>
      )}

      {source.tags?.length > 0 && (
        <ul className="src-tags" aria-label="Tags">
          {source.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}

      <div className="src-actions">
        <button type="button" onClick={onEdit} aria-label={`Editar fonte ${title}`}>
          Editar
        </button>
        <button type="button" className="button-danger" onClick={onRemove} aria-label={`Remover fonte ${title}`}>
          Remover
        </button>
      </div>
    </li>
  )
}
