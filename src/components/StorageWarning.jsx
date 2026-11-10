import { useEffect, useState } from 'react'
import './storage-warning.css'

/**
 * Avisa quando o store não consegue gravar no localStorage (limite de ~5 MB ou
 * armazenamento bloqueado). O store dispara 'grove:storage-error' / 'grove:storage-ok'.
 */
export default function StorageWarning() {
  const [problem, setProblem] = useState(null) // null | 'quota' | 'other'

  useEffect(() => {
    const onError = (e) => setProblem(e.detail?.quota ? 'quota' : 'other')
    const onOk = () => setProblem(null)
    window.addEventListener('grove:storage-error', onError)
    window.addEventListener('grove:storage-ok', onOk)
    return () => {
      window.removeEventListener('grove:storage-error', onError)
      window.removeEventListener('grove:storage-ok', onOk)
    }
  }, [])

  if (!problem) return null

  return (
    <div className="storage-warning" role="alert">
      <p>
        {problem === 'quota'
          ? 'O armazenamento do navegador está cheio e as últimas alterações não foram salvas.'
          : 'Não foi possível salvar seus dados neste navegador. As últimas alterações podem se perder ao recarregar.'}{' '}
        Use <strong>Exportar dados</strong> agora para guardar um backup
        {problem === 'quota' ? ' e apague notas ou fontes grandes que não precisa mais.' : '.'}
      </p>
      <button type="button" onClick={() => setProblem(null)}>
        Fechar aviso
      </button>
    </div>
  )
}
