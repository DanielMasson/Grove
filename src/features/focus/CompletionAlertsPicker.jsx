import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { notificationPermission, requestNotificationPermission } from './completionAlerts'

/** Avisos ao terminar a sessão (tudo desligado por padrão; a permissão só é pedida por clique). */
export default function CompletionAlertsPicker() {
  const notify = useStore((s) => s.settings.notifyOnComplete)
  const sound = useStore((s) => s.settings.soundOnComplete)
  const updateSettings = useStore((s) => s.updateSettings)
  const [permission, setPermission] = useState(notificationPermission)

  const granted = permission === 'granted'
  const canAsk = permission === 'default'

  const onEnable = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') updateSettings({ notifyOnComplete: true })
  }

  return (
    <fieldset className="pickers-fieldset">
      <legend>Avisos ao terminar</legend>
      <div className="alerts-options">
        <label className="alerts-option">
          <input
            type="checkbox"
            checked={notify && granted}
            disabled={!granted}
            onChange={(e) => updateSettings({ notifyOnComplete: e.target.checked })}
          />
          Notificação
        </label>
        <label className="alerts-option">
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => updateSettings({ soundOnComplete: e.target.checked })}
          />
          Som
        </label>
      </div>
      {canAsk && (
        <button type="button" className="alerts-enable" onClick={onEnable}>
          Ativar avisos
        </button>
      )}
      {permission === 'denied' && (
        <p className="hint" role="status">
          As notificações estão bloqueadas neste navegador. Libere nas configurações do site para ativá-las.
        </p>
      )}
      {permission === 'unsupported' && (
        <p className="hint">Este navegador não oferece notificações. O aviso sonoro continua disponível.</p>
      )}
      {granted && (
        <p className="hint">A notificação aparece só quando a aba do Grove estiver em segundo plano.</p>
      )}
    </fieldset>
  )
}
