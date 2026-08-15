export type CameraFocusMode = 'live' | 'recording'

export interface CameraFocusRouteState {
  cameraId: number | null
  mode: CameraFocusMode
  selectedEventId?: number
}

export function parseCameraFocusRouteState(
  cameraIdParam: string | undefined,
  searchParams: URLSearchParams
): CameraFocusRouteState {
  const cameraId = parsePositiveInteger(cameraIdParam)
  const mode = searchParams.get('mode') === 'recording' ? 'recording' : 'live'
  const selectedEventId = parsePositiveInteger(searchParams.get('eventId') || undefined)

  return {
    cameraId,
    mode,
    selectedEventId: selectedEventId ?? undefined,
  }
}

function parsePositiveInteger(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}
