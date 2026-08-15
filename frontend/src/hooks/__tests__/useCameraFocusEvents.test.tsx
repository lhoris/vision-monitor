import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCameraFocusEvents } from '../useCameraFocusEvents'
import { focusApiService } from '@/services'

const range = {
  from: '2026-08-15T08:00:00+09:00',
  to: '2026-08-15T09:00:00+09:00',
}

describe('useCameraFocusEvents', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads camera events for the recording timeline range when enabled', async () => {
    const getCameraEvents = vi.spyOn(focusApiService, 'getCameraEvents')

    const { result } = renderHook(() =>
      useCameraFocusEvents({
        cameraId: 1,
        enabled: true,
        range,
      })
    )

    await waitFor(() => expect(result.current.eventsLoading).toBe(false))

    expect(result.current.events.map((event) => event.eventId)).toEqual([50001, 50002])
    expect(getCameraEvents).toHaveBeenCalledWith(1, range)
  })

  it('does not request events when recording mode is disabled', () => {
    const getCameraEvents = vi.spyOn(focusApiService, 'getCameraEvents')

    const { result } = renderHook(() =>
      useCameraFocusEvents({
        cameraId: 1,
        enabled: false,
        range,
      })
    )

    expect(result.current.events).toEqual([])
    expect(result.current.eventsError).toBeNull()
    expect(getCameraEvents).not.toHaveBeenCalled()
  })
})
