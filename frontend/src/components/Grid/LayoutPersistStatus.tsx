import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '@/store'
import './LayoutPersistStatus.css'

const SUCCESS_TOAST_MS = 1800

const STATUS_LABELS = {
  idle: '',
  loading: '',
  pending: '변경사항 저장 대기 중',
  saving: '레이아웃 저장 중',
  saved: '레이아웃 저장됨',
  saveFailed: '레이아웃 저장 실패',
  restoreFailed: '기본 레이아웃 사용 중',
} as const

const STATUS_DETAILS = {
  pending: '잠시 후 자동 저장됩니다',
  saving: '변경사항을 반영하고 있습니다',
  saved: '개인 레이아웃에 반영했습니다',
  saveFailed: '변경사항을 저장하지 못했습니다',
  restoreFailed: '저장된 레이아웃을 불러오지 못했습니다',
} as const

export function LayoutPersistStatus() {
  const status = useAppSelector((state) => state.layout.persistStatus)
  const error = useAppSelector((state) => state.layout.persistError)
  const [showSaved, setShowSaved] = useState(false)
  const previousStatus = useRef(status)

  useEffect(() => {
    if (status === 'saving') setShowSaved(false)

    if (status === 'saved' && previousStatus.current === 'saving') {
      setShowSaved(true)
      const timeout = window.setTimeout(() => setShowSaved(false), SUCCESS_TOAST_MS)
      previousStatus.current = status
      return () => window.clearTimeout(timeout)
    }

    previousStatus.current = status
    return undefined
  }, [status])

  const isPersistentProblem = status === 'saveFailed' || status === 'restoreFailed'
  const isTransientState = status === 'pending' || status === 'saving'
  if (!isPersistentProblem && !isTransientState && !showSaved) return null

  const visibleStatus = showSaved ? 'saved' : status
  const detail = isPersistentProblem && error ? error : STATUS_DETAILS[visibleStatus as keyof typeof STATUS_DETAILS]

  return (
    <div
      className={`layout-persist-toast layout-persist-toast--${visibleStatus}`}
      title={error || STATUS_LABELS[visibleStatus]}
      role={isPersistentProblem ? 'alert' : 'status'}
      aria-live={isPersistentProblem ? 'assertive' : 'polite'}
    >
      <span className="layout-persist-toast__icon" aria-hidden="true">
        {isTransientState ? (
          <span className="layout-persist-toast__spinner" />
        ) : visibleStatus === 'saved' ? (
          <svg viewBox="0 0 20 20" fill="none"><path d="m5 10.2 3.2 3.2L15.5 6" /></svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none"><path d="M10 6.2v4.3m0 3.1h.01M10 2.7a7.3 7.3 0 1 0 0 14.6 7.3 7.3 0 0 0 0-14.6Z" /></svg>
        )}
      </span>
      <span className="layout-persist-toast__copy">
        <strong>{STATUS_LABELS[visibleStatus]}</strong>
        <span>{detail}</span>
      </span>
      {showSaved && <span className="layout-persist-toast__progress" aria-hidden="true" />}
    </div>
  )
}

export default LayoutPersistStatus
