import { useEffect, useRef } from 'react'

/**
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

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      {open && (
        <>
          <h2 id="modal-title">{title}</h2>
          {children}
        </>
      )}
    </dialog>
  )
}
