/**
 * HLSPlayer Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HLSPlayer } from '../HLSPlayer'

describe('HLSPlayer', () => {
  let videoElement: HTMLVideoElement
  let player: HLSPlayer

  const setVideoDuration = (duration: number) => {
    Object.defineProperty(videoElement, 'duration', {
      configurable: true,
      value: duration,
    })
  }

  beforeEach(() => {
    // DOM에서 비디오 요소 생성
    videoElement = document.createElement('video')
    videoElement.id = 'test-video'
    document.body.appendChild(videoElement)

    player = new HLSPlayer(videoElement, 'http://example.com/stream.m3u8')
  })

  afterEach(() => {
    player.destroy()
    if (videoElement.parentElement) {
      videoElement.parentElement.removeChild(videoElement)
    }
  })

  it('should initialize with video element', () => {
    expect(videoElement).toBeTruthy()
    expect(player.getState()).toBe('idle')
  })

  it('should set volume', () => {
    player.setVolume(0.5)
    expect(videoElement.volume).toBe(0.5)
  })

  it('should set muted state', () => {
    player.setMuted(true)
    expect(videoElement.muted).toBe(true)

    player.setMuted(false)
    expect(videoElement.muted).toBe(false)
  })

  it('should set playback rate', () => {
    player.setPlaybackRate(1.5)
    expect(videoElement.playbackRate).toBe(1.5)
  })

  it('should clamp volume between 0 and 1', () => {
    player.setVolume(-1)
    expect(videoElement.volume).toBe(0)

    player.setVolume(2)
    expect(videoElement.volume).toBe(1)
  })

  it('should clamp playback rate between 0.25 and 2', () => {
    player.setPlaybackRate(0.1)
    expect(videoElement.playbackRate).toBe(0.25)

    player.setPlaybackRate(5)
    expect(videoElement.playbackRate).toBe(2)
  })

  it('should seek to valid time', () => {
    setVideoDuration(100)
    player.seek(50)
    expect(videoElement.currentTime).toBe(50)
  })

  it('should clamp seek time', () => {
    setVideoDuration(100)
    player.seek(-10)
    expect(videoElement.currentTime).toBe(0)

    player.seek(150)
    expect(videoElement.currentTime).toBe(100)
  })

  it('should return player stats', () => {
    setVideoDuration(100)
    videoElement.currentTime = 25
    videoElement.volume = 0.8
    videoElement.muted = false
    videoElement.playbackRate = 1

    const stats = player.getStats()
    expect(stats.duration).toBe(100)
    expect(stats.currentTime).toBe(25)
    expect(stats.volume).toBe(0.8)
    expect(stats.muted).toBe(false)
    expect(stats.playbackRate).toBe(1)
  })

  it('should handle play event', () => {
    const callback = vi.fn()
    player.on('timeupdate', (data) => {
      expect(data.state).toBe('playing')
      callback()
    })

    // 수동으로 play 이벤트 발생
    const playEvent = new Event('play')
    videoElement.dispatchEvent(playEvent)

    expect(callback).toHaveBeenCalled()
  })

  it('should handle pause event', () => {
    const callback = vi.fn()
    player.on('timeupdate', (data) => {
      expect(data.state).toBe('paused')
      callback()
    })

    const pauseEvent = new Event('pause')
    videoElement.dispatchEvent(pauseEvent)

    expect(callback).toHaveBeenCalled()
  })

  it('should handle ended event', () => {
    const callback = vi.fn()
    player.on('ended', () => {
      expect(player.getState()).toBe('idle')
      callback()
    })

    const endedEvent = new Event('ended')
    videoElement.dispatchEvent(endedEvent)

    expect(callback).toHaveBeenCalled()
  })

  it('should cleanup resources on destroy', () => {
    player.destroy()
    expect(videoElement.src).toBe('')
    expect(player['listeners'].size).toBe(0)
  })

  it('should remove video event listeners on destroy', () => {
    player.destroy()

    videoElement.dispatchEvent(new Event('play'))

    expect(player.getState()).toBe('idle')
  })

  it('should have quality levels array', () => {
    const qualityLevels = player.getQualityLevels()
    expect(Array.isArray(qualityLevels)).toBe(true)
  })

  it('should get current quality', () => {
    const currentQuality = player.getCurrentQuality()
    // 초기 상태에서는 null이거나 기본값
    expect(currentQuality === null || typeof currentQuality === 'object').toBe(true)
  })
})
