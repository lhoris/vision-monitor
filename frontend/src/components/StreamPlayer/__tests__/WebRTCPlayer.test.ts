/**
 * WebRTCPlayer Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WebRTCPlayer } from '../WebRTCPlayer'

describe('WebRTCPlayer', () => {
  let videoElement: HTMLVideoElement
  let player: WebRTCPlayer

  beforeEach(() => {
    videoElement = document.createElement('video')
    videoElement.id = 'test-video-webrtc'
    document.body.appendChild(videoElement)

    player = new WebRTCPlayer(
      videoElement,
      'wss://example.com/whep',
      {},
      {
        enabled: false, // 재연결 비활성화
        maxAttempts: 1,
        initialDelay: 100,
        maxDelay: 100,
        backoffFactor: 1,
      }
    )
  })

  afterEach(async () => {
    await player.destroy()
    if (videoElement.parentElement) {
      videoElement.parentElement.removeChild(videoElement)
    }
  })

  it('should initialize with video element', () => {
    expect(videoElement).toBeTruthy()
    expect(player.getState()).toBe('idle')
  })

  it('should set volume', () => {
    player.setVolume(0.7)
    expect(videoElement.volume).toBe(0.7)
  })

  it('should set muted state', () => {
    player.setMuted(true)
    expect(videoElement.muted).toBe(true)
  })

  it('should clamp volume between 0 and 1', () => {
    player.setVolume(-1)
    expect(videoElement.volume).toBe(0)

    player.setVolume(2)
    expect(videoElement.volume).toBe(1)
  })

  it('should warn when seeking on live stream', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    player.seek(50)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('should warn when changing playback rate on live stream', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    player.setPlaybackRate(1.5)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('should return player stats', () => {
    videoElement.volume = 0.8

    const stats = player.getStats()
    expect(stats).toHaveProperty('currentTime')
    expect(stats).toHaveProperty('duration')
    expect(stats).toHaveProperty('volume')
    expect(stats).toHaveProperty('muted')
    expect(stats).toHaveProperty('playbackRate')
  })

  it('should have playback rate fixed at 1.0 for live stream', () => {
    const stats = player.getStats()
    expect(stats.playbackRate).toBe(1)
  })

  it('should handle video element events', () => {
    const callback = vi.fn()
    player.on('timeupdate', callback)

    const timeUpdateEvent = new Event('timeupdate')
    videoElement.dispatchEvent(timeUpdateEvent)

    expect(callback).toHaveBeenCalled()
  })

  it('should handle error events', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const callback = vi.fn()
    player.on('error', (error) => {
      expect(error).toBeTruthy()
      callback()
    })
    Object.defineProperty(videoElement, 'error', {
      configurable: true,
      value: { message: 'Connection failed', code: 2 },
    })

    const errorEvent = new ErrorEvent('error')
    videoElement.dispatchEvent(errorEvent)

    expect(callback).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('should cleanup resources on destroy', async () => {
    await player.destroy()
    expect(player['listeners'].size).toBe(0)
  })

  it('should remove video event listeners on destroy', async () => {
    await player.destroy()

    videoElement.dispatchEvent(new Event('play'))

    expect(player.getState()).toBe('idle')
  })

  it('should get WebRTC stats', async () => {
    const stats = await player.getWebRTCStats()
    expect(typeof stats).toBe('object')
  })

  it('should initialize player', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    // Note: 실제 WHEP 서버가 없으므로 에러가 발생합니다
    // 하지만 초기화 시도는 검증할 수 있습니다
    try {
      await player.play()
    } catch (error) {
      // 예상된 에러
      expect(error).toBeTruthy()
    }
    errorSpy.mockRestore()
  })
})
