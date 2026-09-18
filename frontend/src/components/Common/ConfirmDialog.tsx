import { useEffect, useRef } from 'react'

export type ConfirmDialogVariant = 'default' | 'danger'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmDialogVariant
  busy?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    cancelButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [busy, isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <button type="button" aria-label="확인창 닫기" className="absolute inset-0 cursor-default" onClick={() => { if (!busy) onCancel() }} />
      <section role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" className="relative w-full max-w-md border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <span aria-hidden="true" className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${variant === 'danger' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200'}`}>{variant === 'danger' ? '!' : '?'}</span>
          <div className="min-w-0"><h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2><p id="confirm-dialog-message" className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p></div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4"><button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={busy} className="border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">{cancelLabel}</button><button type="button" onClick={() => void onConfirm()} disabled={busy} className={`px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{busy ? '처리 중...' : confirmLabel}</button></div>
      </section>
    </div>
  )
}
