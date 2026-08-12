import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { LiveStreamPlayer } from '../LiveStreamPlayer'
import type { Camera } from '@/types/camera'

vi.mock('../StreamPlayerComponent', () => ({
  StreamPlayerComponent: () => <div data-testid="stream-player-component" />,
}))

const camera: Camera = {
  id: 1,
  name: 'Camera 1',
  location: 'Line A-1',
  zone: 'Zone 1',
  streamUrl: 'http://220.81.187.50:1984/stream.html?src=video_high1',
  streamProtocol: 'webrtc',
  status: 'online',
}

describe('LiveStreamPlayer', () => {
  const setVisibilityState = (visibilityState: DocumentVisibilityState) => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: visibilityState,
    })
  }

  afterEach(() => {
    setVisibilityState('visible')
  })

  it('renders stream page urls through iframe adapter', () => {
    render(<LiveStreamPlayer camera={camera} className="w-full h-full" />)

    const iframe = screen.getByTitle('Camera 1 stream')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', camera.streamUrl)
    expect(iframe).toHaveClass('w-full')
    expect(iframe).toHaveClass('h-full')
  })

  it('renders normal stream urls through StreamPlayerComponent', () => {
    render(
      <LiveStreamPlayer
        camera={{
          ...camera,
          streamUrl: 'http://example.com/stream.m3u8',
          streamProtocol: 'hls',
        }}
      />
    )

    expect(screen.getByTestId('stream-player-component')).toBeInTheDocument()
  })

  it('remounts iframe stream page after page resumes', () => {
    setVisibilityState('visible')
    render(<LiveStreamPlayer camera={camera} className="w-full h-full" />)

    const firstIframe = screen.getByTitle('Camera 1 stream')

    act(() => {
      setVisibilityState('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
    })

    act(() => {
      setVisibilityState('visible')
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(screen.getByTitle('Camera 1 stream')).not.toBe(firstIframe)
  })
})
