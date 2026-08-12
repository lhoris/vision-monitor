import { describe, expect, it, vi } from 'vitest'
import { RTSPPlayer } from '../RTSPPlayer'

describe('RTSPPlayer', () => {
  it('should remove canvas click listener on destroy', () => {
    const canvasElement = document.createElement('canvas')
    const requestFullscreen = vi.fn()
    Object.defineProperty(canvasElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    })

    const player = new RTSPPlayer(canvasElement, 'rtsp://example.com/video1')

    player.destroy()
    canvasElement.dispatchEvent(new Event('click'))

    expect(requestFullscreen).not.toHaveBeenCalled()
  })
})
