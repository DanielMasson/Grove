// Avisos ao terminar a sessão (F02): notificação do navegador e tom curto. Tudo opcional e
// desligado por padrão; navegador sem Notification/AudioContext (ex.: iOS Safari) não gera erro.

/** O navegador oferece a API de notificações? */
export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

/** @returns {'granted' | 'denied' | 'default' | 'unsupported'} */
export const notificationPermission = () =>
  notificationsSupported() ? Notification.permission : 'unsupported'

/**
 * Pede a permissão de notificação. Chamar SÓ a partir de um clique do usuário.
 * @returns {Promise<'granted' | 'denied' | 'default' | 'unsupported'>}
 */
export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return notificationPermission()
  }
}

/** Tom curto (880 Hz, ~0,4 s, volume baixo) via Web Audio, sem arquivo externo. */
function playTone() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    ctx.resume?.()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.42)
    osc.onended = () => ctx.close?.()
  } catch {
    /* sem áudio: ignora */
  }
}

/**
 * Dispara os avisos configurados. A notificação só aparece com a aba oculta e permissão concedida.
 * @param {Pick<import('../../types.js').Settings, 'notifyOnComplete' | 'soundOnComplete'>} settings
 */
export function notifySessionComplete(settings) {
  if (
    settings?.notifyOnComplete &&
    document.hidden &&
    notificationPermission() === 'granted'
  ) {
    try {
      new Notification('Grove', { body: 'Sua sessão terminou. Sua árvore cresceu!' })
    } catch {
      /* alguns navegadores móveis exigem service worker: ignora */
    }
  }
  if (settings?.soundOnComplete) playTone()
}
