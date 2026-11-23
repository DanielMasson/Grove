import { useEffect, useRef } from 'react'

/**
 * Modal sobre <dialog> nativo. O padding fica no `.modal-body` (e não no <dialog>), então
 * `e.target === dialog` só acontece ao clicar no fundo (backdrop), nunca numa margem interna.
 * @param {{ open: boolean, title: string, onClose: () => void, children: import('react').ReactNode }} props
 */
export default function Modal({ open, title, onClose, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const onBackdropClick = (e) => {
    if (e.target === ref.current) onClose()
  }

  // O evento `close` também dispara quando o próprio código chama d.close() (open virou false).
  // Só avisa o pai quando o fechamento veio do usuário (Esc), ou seja, com `open` ainda true.
  const onNativeClose = () => {
    if (open) onClose()
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onNativeClose}
      onClick={onBackdropClick}
    >
      {open && (
        <div className="modal-body">
          <h2 id="modal-title">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  )
}
