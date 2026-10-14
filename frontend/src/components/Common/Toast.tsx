import { useEffect, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  variant?: ToastVariant
  onClose?: () => void
}

const variantClassName: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200',
  error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/90 dark:text-blue-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-200',
}

export function Toast({ message, variant = 'info', onClose }: ToastProps) {
  const [rendered, setRendered] = useState(Boolean(message))
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setRendered(true)
      const frameId = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(frameId)
    }

    setVisible(false)
    const timeoutId = window.setTimeout(() => setRendered(false), 220)
    return () => window.clearTimeout(timeoutId)
  }, [message])

  if (!rendered || !message) return null

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`fixed right-6 top-20 z-[120] flex max-w-[min(420px,calc(100vw-48px))] items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg transition duration-200 ease-out ${variantClassName[variant]} ${visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
    >
      <span className="min-w-0 break-words">{message}</span>
      {onClose ? <button type="button" onClick={onClose} className="shrink-0 font-semibold opacity-70 transition-opacity hover:opacity-100" aria-label="알림 닫기">×</button> : null}
    </div>
  )
}
