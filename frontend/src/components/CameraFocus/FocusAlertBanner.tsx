import type { ActiveAlertDto } from '@/types/cameraFocus'

interface FocusAlertBannerProps {
  alerts: ActiveAlertDto[]
}

export function FocusAlertBanner({ alerts }: FocusAlertBannerProps) {
  const alert = alerts[0]
  if (!alert) {
    return null
  }

  return (
    <div role="status" className="border-b border-amber-500 bg-amber-300 px-5 py-3 text-slate-950">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
        <span>{alert.severity}</span>
        <span>{alert.message}</span>
        <span>{alert.location}</span>
        <span>{alert.status}</span>
      </div>
    </div>
  )
}
