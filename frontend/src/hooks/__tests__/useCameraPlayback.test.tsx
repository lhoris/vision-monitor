import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PLAYBACK_RANGE, useCameraPlayback } from '../useCameraPlayback'
import { focusApiService } from '@/services'
import type { ApiResponse } from '@/types/api'
import type { PlaybackSessionDto } from '@/types/cameraFocus'

const playbackResponse: ApiResponse<PlaybackSessionDto> = {
  success: true,
  data: {
    cameraId: 1,
    playbackUrl: 'https://media.test/playback/camera-1.m3u8',
    playbackProtocol: 'hls',
    sessionId: 'session-1',
    expiresAt: '2026-08-15T09:15:00+09:00',
    availableFrom: DEFAULT_PLAYBACK_RANGE.from,
    availableTo: DEFAULT_PLAYBACK_RANGE.to,
    seekable: true,
    preRollSeconds: 10,
    timelineSegments: [],
  },
  timestamp: '2026-08-15T09:00:00+09:00',
}

describe('useCameraPlayback', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads playback session with the default last-hour range when enabled', async () => {
    const getCameraPlayback = vi.spyOn(focusApiService, 'getCameraPlayback').mockResolvedValue(playbackResponse)

    const { result } = renderHook(() =>
      useCameraPlayback({
        cameraId: 1,
        enabled: true,
        eventId: 50001,
      })
    )

    await waitFor(() => expect(result.current.playbackLoading).toBe(false))

    expect(result.current.range).toEqual(DEFAULT_PLAYBACK_RANGE)
    expect(result.current.playbackSession?.playbackUrl).toBe('https://media.test/playback/camera-1.m3u8')
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
