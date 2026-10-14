import { useEffect, useRef, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'
export type ToastPlacement = 'top-right' | 'center'

interface ToastProps {
  message: string
  variant?: ToastVariant
  placement?: ToastPlacement
  onClose?: () => void
}

const variantClassName: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200',
  error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/90 dark:text-blue-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-200',
}

export function Toast({ message, variant = 'info', placement = 'top-right', onClose }: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!message || !onClose) return undefined

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button === 0 && toastRef.current && !toastRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [message, onClose])

  if (!rendered || !message) return null

  return (
    <div
      ref={toastRef}
      role={variant === 'error' ? 'alert' : 'status'}
      className={`fixed z-[120] flex max-w-[min(420px,calc(100vw-48px))] items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg transition duration-200 ease-out ${placement === 'center' ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : 'right-6 top-20'} ${variantClassName[variant]} ${visible ? 'opacity-100' : 'opacity-0'} ${visible || placement === 'center' ? '' : '-translate-y-2'}`}
    >
      <span className="min-w-0 break-words">{message}</span>
      {onClose ? <button type="button" onClick={onClose} className="shrink-0 font-semibold opacity-70 transition-opacity hover:opacity-100" aria-label="알림 닫기">×</button> : null}
    </div>
  )
}
