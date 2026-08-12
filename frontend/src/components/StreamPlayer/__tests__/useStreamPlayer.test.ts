/**
 * useStreamPlayer Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStreamPlayer } from '../useStreamPlayer'
import type { StreamSource } from '@/types/streamPlayer'
import React from 'react'

describe('useStreamPlayer', () => {
  let containerRef: React.RefObject<HTMLDivElement>

  beforeEach(() => {
    // 컨테이너 생성
    const container = document.createElement('div')
    container.id = 'player-container'
    document.body.appendChild(container)
    containerRef = React.createRef()
    containerRef.current = container
  })

  afterEach(() => {
    const container = document.getElementById('player-container')
    if (container && container.parentElement) {
      container.parentElement.removeChild(container)
    }
  })

  it('should initialize hook with idle state', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(result.current.state).toBe('idle')
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should return player instance', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(result.current.player).toBeTruthy()
  })

  it('should provide play method', async () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.play).toBe('function')
  })

  it('should provide pause method', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.pause).toBe('function')
  })

  it('should provide seek method', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.seek).toBe('function')
  })

  it('should provide volume control methods', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.setVolume).toBe('function')
    expect(typeof result.current.setMuted).toBe('function')
  })

  it('should provide playback rate control', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.setPlaybackRate).toBe('function')
  })

  it('should provide quality control for HLS', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.setQuality).toBe('function')
  })

  it('should provide WebRTC stats method', () => {
    const source: StreamSource = {
      url: 'wss://example.com/whep',
      protocol: 'webrtc',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.getWebRTCStats).toBe('function')
  })

  it('should provide event listener methods', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(typeof result.current.on).toBe('function')
    expect(typeof result.current.off).toBe('function')
  })

  it('should return initial stats', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(result.current.stats).toHaveProperty('currentTime')
    expect(result.current.stats).toHaveProperty('duration')
    expect(result.current.stats).toHaveProperty('volume')
    expect(result.current.stats).toHaveProperty('muted')
    expect(result.current.stats).toHaveProperty('playbackRate')
  })

  it('should have empty quality levels initially', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(Array.isArray(result.current.qualityLevels)).toBe(true)
    expect(result.current.qualityLevels.length).toBe(0)
  })

  it('should detect HLS protocol', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(result.current.player).toBeTruthy()
  })

  it('should detect WebRTC protocol', () => {
    const source: StreamSource = {
      url: 'wss://example.com/whep',
      protocol: 'webrtc',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(result.current.player).toBeTruthy()
  })

  it('should detect RTSP protocol', () => {
    const source: StreamSource = {
      url: 'rtsp://example.com/stream',
      protocol: 'rtsp',
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(result.current.player).toBeTruthy()
  })

  it('should cleanup on unmount', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { unmount } = renderHook(() => useStreamPlayer(containerRef, source))

    expect(() => unmount()).not.toThrow()
  })

  it('should handle reconnect config', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const config = {
      reconnect: {
        enabled: true,
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2,
      },
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source, config))

    expect(result.current.player).toBeTruthy()
  })

  it('should handle WebRTC config', () => {
    const source: StreamSource = {
      url: 'wss://example.com/whep',
      protocol: 'webrtc',
    }

    const config = {
      webrtc: {
        enableDataChannel: true,
        whepUrl: 'wss://example.com/whep',
      },
    }

    const { result } = renderHook(() => useStreamPlayer(containerRef, source, config))

    expect(result.current.player).toBeTruthy()
  })

  it('should replace media elements when protocol changes', () => {
    const hlsSource: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }
    const rtspSource: StreamSource = {
      url: 'rtsp://example.com/stream',
      protocol: 'rtsp',
    }

    const { rerender } = renderHook(
      ({ source }) => useStreamPlayer(containerRef, source),
      { initialProps: { source: hlsSource } }
    )

    expect(containerRef.current?.querySelectorAll('video')).toHaveLength(1)
    expect(containerRef.current?.querySelectorAll('canvas')).toHaveLength(0)

    rerender({ source: rtspSource })

    expect(containerRef.current?.querySelectorAll('video')).toHaveLength(0)
    expect(containerRef.current?.querySelectorAll('canvas')).toHaveLength(1)
  })

  it('should remove media elements on unmount', () => {
    const source: StreamSource = {
      url: 'http://example.com/stream.m3u8',
      protocol: 'hls',
    }

    const { unmount } = renderHook(() => useStreamPlayer(containerRef, source))
    expect(containerRef.current?.querySelectorAll('video')).toHaveLength(1)

    unmount()

    expect(containerRef.current?.querySelectorAll('video')).toHaveLength(0)
  })
})
