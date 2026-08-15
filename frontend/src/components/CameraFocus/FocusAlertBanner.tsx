import { useEffect, useState } from 'react'
import type { ActiveAlertDto } from '@/types/cameraFocus'

const DISMISS_ANIMATION_MS = 180

interface FocusAlertBannerProps {
  alerts: ActiveAlertDto[]
}

export function FocusAlertBanner({ alerts }: FocusAlertBannerProps) {
  const [confirmedAlertIds, setConfirmedAlertIds] = useState<Set<number>>(() => new Set())
  const [dismissingAlertId, setDismissingAlertId] = useState<number | null>(null)

  useEffect(() => {
    const activeAlertIds = new Set(alerts.map((alert) => alert.alertId))

    setConfirmedAlertIds((current) => {
      const next = new Set([...current].filter((alertId) => activeAlertIds.has(alertId)))
      return next.size === current.size ? current : next
    })

    setDismissingAlertId((current) => (current && activeAlertIds.has(current) ? current : null))
  }, [alerts])

  const alert = alerts.find((candidate) => !confirmedAlertIds.has(candidate.alertId))
  if (!alert) {
    return null
  }

  const alertId = alert.alertId
  const isDismissing = dismissingAlertId === alertId

  function dismissAlert() {
    if (isDismissing) {
      return
    }

    setDismissingAlertId(alertId)
    window.setTimeout(() => {
      setConfirmedAlertIds((current) => new Set(current).add(alertId))
      setDismissingAlertId(null)
    }, DISMISS_ANIMATION_MS)
  }

  return (
    <aside
      role="alert"
      aria-live="assertive"
      onClick={dismissAlert}
      className={`focus-alert-toast fixed left-1/2 top-24 z-50 w-[min(640px,calc(100vw-48px))] cursor-pointer p-4 shadow-2xl ${
        isDismissing ? 'focus-alert-toast--exit' : 'focus-alert-toast--enter'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="focus-alert-toast__mark" aria-hidden="true">
          !
        </div>
        <div>
          <div className="focus-alert-toast__badge">긴급 경고</div>
          <p className="focus-alert-toast__message mt-1 text-base font-bold">{alert.message}</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="font-semibold">위치</dt>
            <dd>{alert.location}</dd>
            <dt className="font-semibold">등급</dt>
            <dd>{alert.severity}</dd>
            <dt className="font-semibold">상태</dt>
            <dd>{alert.status}</dd>
          </dl>
        </div>
      </div>
    </aside>
  )
}
