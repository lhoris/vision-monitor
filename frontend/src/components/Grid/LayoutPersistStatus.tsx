import { useAppSelector } from '@/store'

const STATUS_LABELS = {
  idle: '',
  loading: '레이아웃 불러오는 중',
  saving: '저장 중',
  saved: '저장됨',
  saveFailed: '저장 실패',
  restoreFailed: '기본 레이아웃 사용 중',
} as const

export function LayoutPersistStatus() {
  const status = useAppSelector((state) => state.layout.persistStatus)
  const error = useAppSelector((state) => state.layout.persistError)

  if (status === 'idle') {
    return null
  }

  const isProblem = status === 'saveFailed' || status === 'restoreFailed'

  return (
    <div
      className={`absolute right-4 top-4 z-10 rounded border px-3 py-1.5 text-xs font-semibold shadow-sm ${
        isProblem
          ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-100'
          : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
      }`}
      title={error || STATUS_LABELS[status]}
      role={isProblem ? 'alert' : 'status'}
    >
      {STATUS_LABELS[status]}
    </div>
  )
}

export default LayoutPersistStatus
