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

  it('should emit events', async () => {
    const callback = vi.fn()
    player.on('timeupdate', callback)

    await player.play()

    expect(callback).toHaveBeenCalled()
  })

  it('should register and trigger event listeners', async () => {
    const callback = vi.fn()
    player.on('timeupdate', callback)
    await player.play()
    player.pause()

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should remove event listeners', async () => {
    const callback = vi.fn()
    player.on('timeupdate', callback)
    player.off('timeupdate', callback)
    await player.play()

    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle multiple listeners on same event', async () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    player.on('timeupdate', callback1)
    player.on('timeupdate', callback2)

    await player.play()

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('should handle errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const callback = vi.fn()
    player.on('error', (error) => {
      expect(error.type).toBe('NETWORK_ERROR')
      expect(error.message).toContain('Network error')
      callback()
    })

    player['handleError']({
      type: 'NETWORK_ERROR',
      message: 'Network error: Connection failed',
    })

    expect(callback).toHaveBeenCalled()
    errorSpy.mockRestore()
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
    player.on('timeupdate', callback)
    player.destroy()

    expect(player['listeners'].size).toBe(0)
  })
})
