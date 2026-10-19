import { useEffect, useState } from 'react'
import { focusApiService } from '@/services'
import type { ActiveAlertDto } from '@/types/cameraFocus'

export function useActiveCameraAlerts(cameraId: number | null) {
  const [alerts, setAlerts] = useState<ActiveAlertDto[]>([])
  const [alertsError, setAlertsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAlerts() {
      if (!cameraId) {
        setAlerts([])
        setAlertsError(null)
        return
      }

      const response = await focusApiService.getActiveAlerts(cameraId)
      console.info('[CameraFocus active alerts] response', {
        cameraId,
        success: response.success,
        alerts: response.success ? (response.data ?? []).map((alert) => ({
          alertId: alert.alertId,
          modelProcessId: alert.modelProcessId,
          message: alert.message,
        })) : [],
      })
      if (!cancelled) {
        setAlerts(response.success ? response.data ?? [] : [])
        setAlertsError(response.success ? null : response.error ?? 'UNKNOWN')
      }
    }

    void loadAlerts()

    return () => {
      cancelled = true
    }
  }, [cameraId])

  return {
    alerts,
    alertsError,
  }
}
