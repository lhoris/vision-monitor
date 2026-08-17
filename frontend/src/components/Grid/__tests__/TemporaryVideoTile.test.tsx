import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DraggableCell } from '../DraggableCell'
import type { TemporaryVideoSource } from '@/types/streamPlayer'

vi.mock('@/components/StreamPlayer/LiveStreamPlayer', () => ({
  LiveStreamPlayer: ({ onStateChange }: { onStateChange?: (state: string) => void }) => (
    <button type="button" data-testid="live-stream-player" onClick={() => onStateChange?.('playing')}>
      player
    </button>
  ),
}))

const source: TemporaryVideoSource = {
  id: 'temporary-1',
  url: 'https://media.test/live.m3u8',
  protocol: 'hls',
  displayName: '외부 영상',
  playbackStatus: 'idle',
}

describe('TemporaryVideoTile', () => {
  it('reports playback status and exposes source edit/remove actions', () => {
    const onStatusChange = vi.fn()
    const onEdit = vi.fn()
    const onRemove = vi.fn()

    render(
      <DraggableCell
        cellId="cell-0"
        index={0}
        positionId={-1}
        temporarySource={source}
        onAddCamera={vi.fn()}
        onRemoveCamera={onRemove}
        onEditTemporarySource={onEdit}
        onTemporaryStatusChange={onStatusChange}
      />
    )

    expect(screen.getByRole('heading', { name: '외부 영상' })).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('live-stream-player'))
    expect(onStatusChange).toHaveBeenCalledWith('playing')

    fireEvent.contextMenu(screen.getByRole('heading', { name: '외부 영상' }))
    fireEvent.click(screen.getByRole('button', { name: '주소 수정' }))
    expect(onEdit).toHaveBeenCalledTimes(1)

    fireEvent.contextMenu(screen.getByRole('heading', { name: '외부 영상' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
