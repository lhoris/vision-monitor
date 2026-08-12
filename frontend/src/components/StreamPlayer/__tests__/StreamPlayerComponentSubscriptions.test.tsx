import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { StreamPlayerComponent } from '../StreamPlayerComponent'
import type { StreamSource } from '@/types/streamPlayer'

const onMock = vi.fn()
const offMock = vi.fn()
let currentStats = {
  currentTime: 1,
  duration: 10,
  buffered: { start: 0, end: 0 },
  volume: 1,
  muted: false,
  playbackRate: 1,
}

vi.mock('../useStreamPlayer', () => ({
  useStreamPlayer: () => ({
    state: 'playing',
    stats: currentStats,
    error: null,
    isLoading: false,
    qualityLevels: [],
    currentQuality: null,
    play: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setPlaybackRate: vi.fn(),
    setQuality: vi.fn(),
    on: onMock,
    off: offMock,
  }),
}))

describe('StreamPlayerComponent subscriptions', () => {
  const source: StreamSource = {
    url: 'http://example.com/stream.m3u8',
    protocol: 'hls',
  }

  afterEach(() => {
    vi.clearAllMocks()
    currentStats = {
      currentTime: 1,
      duration: 10,
      buffered: { start: 0, end: 0 },
      volume: 1,
      muted: false,
      playbackRate: 1,
    }
  })

  it('removes the same timeupdate callback that it registers', () => {
    const onTimeUpdate = vi.fn()
    const { unmount } = render(
      <StreamPlayerComponent source={source} onTimeUpdate={onTimeUpdate} />
    )

    const registeredCallback = onMock.mock.calls.find(([event]) => event === 'timeupdate')?.[1]
    unmount()
    const removedCallback = offMock.mock.calls.find(([event]) => event === 'timeupdate')?.[1]

    expect(registeredCallback).toBeTypeOf('function')
    expect(removedCallback).toBe(registeredCallback)
  })

  it('does not resubscribe timeupdate when only stats change', () => {
    const onTimeUpdate = vi.fn()
    const { rerender } = render(
      <StreamPlayerComponent source={source} onTimeUpdate={onTimeUpdate} />
    )
    const timeUpdateSubscriptions = () =>
      onMock.mock.calls.filter(([event]) => event === 'timeupdate').length

    expect(timeUpdateSubscriptions()).toBe(1)

    currentStats = {
      ...currentStats,
      currentTime: 2,
    }
    rerender(<StreamPlayerComponent source={source} onTimeUpdate={onTimeUpdate} />)

    expect(timeUpdateSubscriptions()).toBe(1)
  })
})
