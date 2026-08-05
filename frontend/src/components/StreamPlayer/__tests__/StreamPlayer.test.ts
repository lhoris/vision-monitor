/**
 * StreamPlayer Base Class Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StreamPlayer } from '../StreamPlayer'

// 테스트용 Mock StreamPlayer
class MockStreamPlayer extends StreamPlayer {
  private mockVideoElement: HTMLVideoElement | null = null

  constructor(url: string) {
    super(url, {
      enabled: true,
      maxAttempts: 3,
      initialDelay: 100,
      maxDelay: 1000,
      backoffFactor: 2,
    })
  }

  async play(): Promise<void> {
    this.setState('playing')
  }

  pause(): void {
    this.setState('paused')
  }

  seek(time: number): void {
    // Mock implementation
  }

  setVolume(volume: number): void {
    // Mock implementation
  }

  setMuted(muted: boolean): void {
    // Mock implementation
  }

  setPlaybackRate(rate: number): void {
    // Mock implementation
  }

  getStats() {
    return {
      currentTime: 0,
      duration: 100,
      buffered: { start: 0, end: 0 },
      volume: 1,
      muted: false,
      playbackRate: 1,
    }
  }

  destroy(): void {
    this.listeners.clear()
  }
}

describe('StreamPlayer', () => {
  let player: MockStreamPlayer

  beforeEach(() => {
    player = new MockStreamPlayer('http://example.com/stream.m3u8')
  })

  afterEach(() => {
    player.destroy()
  })

  it('should initialize with correct state', () => {
    expect(player.getState()).toBe('idle')
  })

  it('should change state when playing', async () => {
    await player.play()
    expect(player.getState()).toBe('playing')
  })

  it('should change state when paused', async () => {
    await player.play()
    player.pause()
    expect(player.getState()).toBe('paused')
  })

  it('should emit events', (done) => {
    player.on('play', () => {
      expect(true).toBe(true)
      done()
    })

    player.play().catch(() => {
      // Handle error
    })
  })

  it('should register and trigger event listeners', (done) => {
    const callback = vi.fn()
    player.on('pause', callback)
    player.pause()

    setTimeout(() => {
      expect(callback).toHaveBeenCalled()
      done()
    }, 100)
  })

  it('should remove event listeners', () => {
    const callback = vi.fn()
    player.on('play', callback)
    player.off('play', callback)
    player.play().catch(() => {
      // Handle error
    })

    setTimeout(() => {
      expect(callback).not.toHaveBeenCalled()
    }, 100)
  })

  it('should handle multiple listeners on same event', (done) => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    player.on('play', callback1)
    player.on('play', callback2)

    player.play().catch(() => {
      // Handle error
    })

    setTimeout(() => {
      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
      done()
    }, 100)
  })

  it('should handle errors', (done) => {
    player.on('error', (error) => {
      expect(error.type).toBe('NETWORK_ERROR')
      expect(error.message).toContain('Network error')
      done()
    })

    player['handleError']({
      type: 'NETWORK_ERROR',
      message: 'Network error: Connection failed',
    })
  })

  it('should return player stats', () => {
    const stats = player.getStats()
    expect(stats).toHaveProperty('currentTime')
    expect(stats).toHaveProperty('duration')
    expect(stats).toHaveProperty('volume')
    expect(stats).toHaveProperty('muted')
    expect(stats).toHaveProperty('playbackRate')
  })

  it('should cleanup listeners on destroy', () => {
    const callback = vi.fn()
    player.on('play', callback)
    player.destroy()

    expect(player['listeners'].size).toBe(0)
  })
})
