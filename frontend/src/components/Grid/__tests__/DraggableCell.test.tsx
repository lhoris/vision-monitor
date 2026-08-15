import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DraggableCell } from '../DraggableCell'
import type { Camera } from '@/types/camera'

vi.mock('@/components/StreamPlayer/LiveStreamPlayer', () => ({
  LiveStreamPlayer: () => <div data-testid="live-stream-player" />,
}))

const camera: Camera = {
  id: 1,
  name: 'Entry Zone CAM-01',
  location: 'Entry Zone',
  zone: 'Cooling',
  streamUrl: 'https://media.example.local/stream.html?src=video_high1',
  streamProtocol: 'stream_page',
  status: 'online',
}

describe('DraggableCell focus action', () => {
  it('calls focus action for a camera cell without removing add-camera behavior', () => {
    const onFocusCamera = vi.fn()

    render(
      <DraggableCell
        cellId="cell-0"
        index={0}
        camera={camera}
        onAddCamera={vi.fn()}
        onRemoveCamera={vi.fn()}
        onFocusCamera={onFocusCamera}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Entry Zone CAM-01 확대 보기' }))

    expect(onFocusCamera).toHaveBeenCalledWith(1)
  })

  it('keeps empty cell add camera action', () => {
    const onAddCamera = vi.fn()

    render(
      <DraggableCell
        cellId="cell-0"
        index={0}
        onAddCamera={onAddCamera}
        onRemoveCamera={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add camera to this cell' }))

    expect(onAddCamera).toHaveBeenCalledTimes(1)
  })
})
