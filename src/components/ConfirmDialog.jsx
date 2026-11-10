import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', danger, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="dialog-actions">
        <button type="button" className={danger ? 'button-danger' : 'button-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" autoFocus onClick={onCancel}>Cancelar</button>
      </div>
    </Modal>
  )
}
