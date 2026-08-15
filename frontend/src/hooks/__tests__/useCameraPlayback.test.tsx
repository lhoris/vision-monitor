import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PLAYBACK_RANGE, useCameraPlayback } from '../useCameraPlayback'
import { focusApiService } from '@/services'

describe('useCameraPlayback', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads playback session with the default last-hour range when enabled', async () => {
    const getCameraPlayback = vi.spyOn(focusApiService, 'getCameraPlayback')

    const { result } = renderHook(() =>
      useCameraPlayback({
        cameraId: 1,
        enabled: true,
        eventId: 50001,
      })
    )

    await waitFor(() => expect(result.current.playbackLoading).toBe(false))

    expect(result.current.range).toEqual(DEFAULT_PLAYBACK_RANGE)
    expect(result.current.playbackSession?.playbackUrl).toBe(
      'https://media.example.local/playback/session/playback-cam-1-20260815-0800/index.m3u8'
    )
    expect(getCameraPlayback).toHaveBeenCalledWith(1, {
      ...DEFAULT_PLAYBACK_RANGE,
      eventId: 50001,
    })
  })

  it('does not request playback when recording mode is disabled', () => {
    const getCameraPlayback = vi.spyOn(focusApiService, 'getCameraPlayback')

    const { result } = renderHook(() =>
      useCameraPlayback({
        cameraId: 1,
        enabled: false,
      })
    )

    expect(result.current.playbackSession).toBeNull()
    expect(result.current.playbackError).toBeNull()
    expect(getCameraPlayback).not.toHaveBeenCalled()
  })
})
