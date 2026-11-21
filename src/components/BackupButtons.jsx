import { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { useTimer } from '../features/focus/useTimer'
import { todayLocal } from '../lib/kanban'
import { buildExampleData } from '../lib/exampleData'
import ConfirmDialog from './ConfirmDialog'
import './backup.css'

const ACTIVE_MSG = 'Termine ou desista da sessão antes de importar.'
const ACTIVE_MSG_OTHER = 'Termine ou desista da sessão de foco antes de mudar os dados.'

/** Textos de cada ação que pede confirmação. */
const CONFIRM = {
  import: {
    title: 'Importar dados?',
    message: 'Importar substitui os dados atuais. Continuar?',
    confirmLabel: 'Sim, importar',
    danger: false,
  },
  example: {
    title: 'Carregar dados de exemplo?',
    message: 'Os dados de exemplo substituem os dados atuais. Continuar?',
    confirmLabel: 'Sim, carregar',
    danger: true,
  },
  reset: {
    title: 'Apagar tudo?',
    message: 'Isso apaga cadernos, tarefas, árvores, sessões e configurações. Não dá para desfazer. Continuar?',
    confirmLabel: 'Sim, apagar tudo',
    danger: true,
  },
}

export default function BackupButtons() {
  const fileRef = useRef(null)
  const detailsRef = useRef(null)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetData = useStore((s) => s.resetData)

  const [pending, setPending] = useState(null) // { kind: 'import' | 'example' | 'reset', json?: string }
  const [status, setStatus] = useState(null) // { text: string, error?: boolean }

  const sessionActive = () => useTimer.getState().active

  const onExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grove-backup-${todayLocal()}.json`
    document.body.append(a) // Safari exige o link no documento
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const onPickFile = async (e) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    setStatus(null)
    try {
      if (sessionActive()) {
        setStatus({ text: ACTIVE_MSG, error: true })
        return
      }
      setPending({ kind: 'import', json: await file.text() })
    } catch {
      setStatus({ text: 'Não foi possível ler o arquivo.', error: true })
    } finally {
      input.value = '' // sempre: permite escolher o mesmo arquivo de novo (inclusive após cancelar)
    }
  }

  const startAction = (kind) => {
    detailsRef.current?.removeAttribute('open')
    setStatus(null)
    if (sessionActive()) {
      setStatus({ text: ACTIVE_MSG_OTHER, error: true })
      return
    }
    setPending({ kind })
  }

  const onConfirm = () => {
    const action = pending
    setPending(null)
    if (!action) return
    if (sessionActive()) {
      setStatus({ text: action.kind === 'import' ? ACTIVE_MSG : ACTIVE_MSG_OTHER, error: true })
      return
    }
    try {
      if (action.kind === 'import') {
        importData(action.json)
        setStatus({ text: 'Dados importados.' })
      } else if (action.kind === 'example') {
        importData(JSON.stringify(buildExampleData()))
        setStatus({ text: 'Dados de exemplo carregados.' })
      } else {
        resetData()
        setStatus({ text: 'Todos os dados foram apagados.' })
      }
    } catch (err) {
      setStatus({ text: err.message, error: true })
    }
  }

  const confirm = pending ? CONFIRM[pending.kind] : null

  return (
    <div className="backup">
      <button type="button" onClick={onExport}>Exportar dados</button>
      <button type="button" onClick={() => fileRef.current?.click()}>Importar dados</button>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={onPickFile} aria-label="Importar backup JSON" />

      <details className="backup-more" ref={detailsRef}>
        <summary>Mais opções</summary>
        <div className="backup-more-menu">
          <button type="button" onClick={() => startAction('example')}>Carregar dados de exemplo</button>
          <button type="button" className="button-danger" onClick={() => startAction('reset')}>Apagar tudo</button>
        </div>
      </details>

      <p className={`hint backup-status${status?.error ? ' field-error' : ''}`} role="status">
        {status?.text ?? ''}
      </p>

      <ConfirmDialog
        open={Boolean(pending)}
        danger={confirm?.danger}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={onConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
