import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import styles from './Dialog.module.scss'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Dialog({ open, onClose, title, children, size = 'md' }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handler = () => onClose()
    el.addEventListener('close', handler)
    return () => el.removeEventListener('close', handler)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClick={handleBackdropClick}>
      <div className={`${styles.panel} ${styles[size]}`}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.close} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  )
}
