import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import { safeHttpUrl } from '../../lib/url'
import { parseYouTubeId } from '../../lib/youtube'

export const TITLE_MAX = 120
export const NOTE_MAX = 20000

const TYPES = [
  ['link', 'Link'],
  ['youtube', 'Vídeo do YouTube'],
  ['note', 'Nota'],
]

/**
 * Modal para criar/editar uma fonte. Ao editar, o tipo não muda.
 * `onSubmit` recebe { type, title, url?, text?, tags } já validados e pode lançar Error.
 * @param {{
 *   open: boolean,
 *   initial?: import('../../types.js').Source,
 *   onSubmit: (data: Omit<import('../../types.js').Source, 'id'>) => void,
 *   onClose: () => void,
 * }} props
 */
export default function SourceForm({ open, initial, onSubmit, onClose }) {
  const [type, setType] = useState('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [tags, setTags] = useState([])
  const [tagDraft, setTagDraft] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setType(initial?.type ?? 'link')
    setTitle(initial?.title ?? '')
    setUrl(initial?.url ?? '')
    setText(initial?.text ?? '')
    setTags(initial?.tags ?? [])
    setTagDraft('')
    setErrors({})
  }, [open, initial])

  const clear = (k) => setErrors((p) => ({ ...p, [k]: undefined }))

  const commitTags = (raw) => {
    const parts = raw.split(',').map((t) => t.trim()).filter(Boolean)
    if (parts.length) setTags((prev) => [...new Set([...prev, ...parts])])
    setTagDraft('')
  }

  const submit = (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    const finalTags = [...new Set([...tags, ...tagDraft.split(',').map((t) => t.trim()).filter(Boolean)])]
    /** @type {Record<string, string>} */
    const next = {}
    if (trimmed.length > TITLE_MAX) next.title = `O título pode ter no máximo ${TITLE_MAX} caracteres.`

    let data
    if (type === 'note') {
      if (!trimmed) next.title = 'Informe o título da nota.'
      if (!text.trim()) next.text = 'Escreva o texto da nota.'
      else if (text.length > NOTE_MAX) next.text = `A nota pode ter no máximo ${NOTE_MAX} caracteres.`
      data = { type, title: trimmed, text, tags: finalTags }
    } else {
      const safe = safeHttpUrl(url)
      if (!safe) next.url = type === 'youtube' ? 'Link de vídeo do YouTube inválido.' : 'Informe um link http ou https válido.'
      else if (type === 'youtube' && !parseYouTubeId(safe)) next.url = 'Link de vídeo do YouTube inválido.'
      const fallback = type === 'youtube' ? 'Vídeo do YouTube' : safe ? new URL(safe).hostname.replace(/^www\./, '') : ''
      data = { type, title: trimmed || fallback, url: safe ?? '', tags: finalTags }
    }

    setErrors(next)
    if (Object.keys(next).length > 0) return
    try {
      onSubmit(data)
    } catch (err) {
      setErrors({ url: err.message })
    }
  }

  const fieldError = (key, id) =>
    errors[key] && (
      <p id={id} className="field-error" role="alert">
        {errors[key]}
      </p>
    )

  return (
    <Modal open={open} title={initial ? 'Editar fonte' : 'Adicionar fonte'} onClose={onClose}>
      <form className="nb-form src-form" onSubmit={submit} noValidate>
        <fieldset className="pickers-fieldset" disabled={Boolean(initial)}>
          <legend>Tipo</legend>
          <div className="src-types">
            {TYPES.map(([id, label]) => (
              <label key={id} className="src-type-option">
                <input type="radio" name="source-type" value={id} checked={type === id} onChange={() => { setType(id); setErrors({}) }} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="sf-title">{type === 'note' ? 'Título *' : 'Título (opcional)'}</label>
          <input
            id="sf-title"
            type="text"
            value={title}
            maxLength={TITLE_MAX}
            autoComplete="off"
            onChange={(e) => { setTitle(e.target.value); clear('title') }}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'sf-title-error' : undefined}
          />
          {fieldError('title', 'sf-title-error')}
        </div>

        {type === 'note' ? (
          <div className="field">
            <label htmlFor="sf-text">Texto *</label>
            <textarea
              id="sf-text"
              rows={6}
              value={text}
              maxLength={NOTE_MAX}
              onChange={(e) => { setText(e.target.value); clear('text') }}
              aria-invalid={errors.text ? true : undefined}
              aria-describedby={errors.text ? 'sf-text-error' : undefined}
            />
            {fieldError('text', 'sf-text-error')}
          </div>
        ) : (
          <div className="field">
            <label htmlFor="sf-url">{type === 'youtube' ? 'Link do vídeo *' : 'Link *'}</label>
            <input
              id="sf-url"
              type="text"
              inputMode="url"
              value={url}
              autoComplete="off"
              onChange={(e) => { setUrl(e.target.value); clear('url') }}
              aria-invalid={errors.url ? true : undefined}
              aria-describedby={errors.url ? 'sf-url-error' : undefined}
            />
            {fieldError('url', 'sf-url-error')}
          </div>
        )}

        <div className="field">
          <label htmlFor="sf-tags">Tags</label>
          <input
            id="sf-tags"
            type="text"
            value={tagDraft}
            autoComplete="off"
            aria-describedby="sf-tags-hint"
            onChange={(e) => {
              const v = e.target.value
              if (v.includes(',')) commitTags(v)
              else setTagDraft(v)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitTags(tagDraft)
              }
            }}
          />
          <p id="sf-tags-hint" className="hint">Separe por vírgula ou Enter.</p>
          {tags.length > 0 && (
            <ul className="src-tags src-tags-edit" aria-label="Tags adicionadas">
              {tags.map((t) => (
                <li key={t}>
                  {t}
                  <button type="button" aria-label={`Remover tag ${t}`} onClick={() => setTags((p) => p.filter((x) => x !== t))}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dialog-actions">
          <button type="submit" className="button-primary">Salvar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
