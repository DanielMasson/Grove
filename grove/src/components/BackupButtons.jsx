import { useRef } from 'react'
import { useStore } from '../store/useStore'

export default function BackupButtons() {
  const fileRef = useRef(null)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)

  const onExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `grove-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const onImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('Importar substitui os dados atuais. Continuar?')) return
    try {
      importData(await file.text())
    } catch (err) {
      alert(err.message)
    }
    e.target.value = ''
  }

  return (
    <div className="backup">
      <button onClick={onExport}>Exportar dados</button>
      <button onClick={() => fileRef.current?.click()}>Importar dados</button>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImport} aria-label="Importar backup JSON" />
    </div>
  )
}
