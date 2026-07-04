import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" size="sm" disabled={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" size="sm" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="confirm-modal-body">
        <div className="confirm-modal-icon">
          <AlertTriangle size={20} />
        </div>
        <p style={{ margin: 0, color: 'var(--color-text)', lineHeight: 1.5 }}>{message}</p>
      </div>
    </Modal>
  )
}
