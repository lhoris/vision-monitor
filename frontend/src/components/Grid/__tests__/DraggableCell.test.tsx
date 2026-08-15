import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('keeps title and status indicator outside the video area without duplicate status text', () => {
    render(
      <DraggableCell
        cellId="cell-0"
        index={0}
        camera={camera}
        onAddCamera={vi.fn()}
        onRemoveCamera={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Entry Zone CAM-01' })).toBeInTheDocument()
    expect(screen.getByLabelText('Status: online')).toBeInTheDocument()
    expect(screen.queryByText('online')).not.toBeInTheDocument()
    expect(screen.queryByText('Entry Zone')).not.toBeInTheDocument()

    const videoArea = screen.getByTestId('camera-tile-video')
    expect(within(videoArea).getByTestId('live-stream-player')).toBeInTheDocument()
    expect(within(videoArea).queryByText('Entry Zone CAM-01')).not.toBeInTheDocument()
    expect(within(videoArea).queryByText('online')).not.toBeInTheDocument()
  })

  it('uses theme-aware title styling and keeps the focus button subdued until interaction', () => {
    render(
      <DraggableCell
        cellId="cell-0"
        index={0}
        camera={camera}
        onAddCamera={vi.fn()}
        onRemoveCamera={vi.fn()}
      />
    )

    expect(screen.getByTitle('Drag to move camera')).toHaveClass('camera-tile-header')
    expect(screen.getByRole('heading', { name: 'Entry Zone CAM-01' })).toHaveClass('camera-tile-header__title')
    expect(screen.getByRole('button', { name: 'Entry Zone CAM-01 확대 보기' })).toHaveClass(
      'opacity-0',
      'group-hover:opacity-100',
      'focus:opacity-100'
    )
  })

  it('uses the same overall aspect ratio for camera and add-camera cells', () => {
    const { rerender } = render(
      <DraggableCell
        cellId="cell-0"
        index={0}
        camera={camera}
        onAddCamera={vi.fn()}
        onRemoveCamera={vi.fn()}
      />
    )

    expect(screen.getByTestId('camera-tile')).toHaveClass('aspect-video')

    rerender(
      <DraggableCell
        cellId="cell-0"
        index={0}
        onAddCamera={vi.fn()}
        onRemoveCamera={vi.fn()}
      />
    )

    expect(screen.getByTestId('add-camera-tile')).toHaveClass('aspect-video')
  })

  it('renames the visible camera title from the context menu', () => {
    const onRenameCamera = vi.fn()

    render(
      <DraggableCell
        cellId="cell-0"
        index={0}
        camera={camera}
        onAddCamera={vi.fn()}
        onRemoveCamera={vi.fn()}
        onRenameCamera={onRenameCamera}
      />
    )

    fireEvent.contextMenu(screen.getByRole('heading', { name: 'Entry Zone CAM-01' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }))

    expect(screen.getByRole('dialog', { name: 'Rename camera title' })).toHaveClass('camera-rename-dialog')
    expect(screen.getByLabelText('Title')).toHaveClass('camera-rename-dialog__input')

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '공냉대 진입부' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('heading', { name: '공냉대 진입부' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공냉대 진입부 확대 보기' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Rename camera title' })).not.toBeInTheDocument()
    expect(onRenameCamera).toHaveBeenCalledWith(1, '공냉대 진입부')
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
