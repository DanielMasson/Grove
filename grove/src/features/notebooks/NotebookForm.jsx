import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import BiomePicker from './BiomePicker'
import { DEFAULT_BIOME } from '../../biomes/config'
import { useStore } from '../../store/useStore'

export const NB_NAME_MAX = 60

/**
 * Modal para criar ou editar um caderno (nome + bioma).
 * @param {{
 *   open: boolean,
 *   initial?: import('../../types.js').Notebook,
 *   onSubmit: (data: { name: string, biome: import('../../types.js').BiomeId }) => void,
 *   onClose: () => void,
 * }} props
 */
export default function NotebookForm({ open, initial, onSubmit, onClose }) {
  const notebooks = useStore((s) => s.notebooks)
  const [name, setName] = useState('')
  const [biome, setBiome] = useState(DEFAULT_BIOME)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setBiome(initial?.biome ?? DEFAULT_BIOME)
    setError('')
  }, [open, initial])

  const trimmed = name.trim()
  const duplicate = Boolean(trimmed) && notebooks.some((n) => n.id !== initial?.id && n.name === trimmed)

  const submit = (e) => {
    e.preventDefault()
    if (!trimmed) {
      setError('Informe o nome do caderno.')
      return
    }
    if (trimmed.length > NB_NAME_MAX) {
      setError(`O nome pode ter no máximo ${NB_NAME_MAX} caracteres.`)
      return
    }
    setError('')
    onSubmit({ name: trimmed, biome })
  }

  return (
    <Modal open={open} title={initial ? 'Editar caderno' : 'Novo caderno'} onClose={onClose}>
      <form className="nb-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="nb-name">Nome</label>
          <input
            id="nb-name"
            type="text"
            value={name}
            maxLength={NB_NAME_MAX}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'nb-name-error' : undefined}
          />
          {error && (
            <p id="nb-name-error" className="field-error" role="alert">
              {error}
            </p>
          )}
          {duplicate && !error && <p className="hint">Já existe um caderno com esse nome.</p>}
        </div>

        <BiomePicker value={biome} onChange={setBiome} />

        <div className="dialog-actions">
          <button type="submit" className="button-primary">
            Salvar
          </button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}
