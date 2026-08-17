import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddCameraDialog } from '../AddCameraDialog'
import type { Camera } from '@/types/camera'

const cameras: Camera[] = [{
  id: 1,
  name: 'Camera 1',
  location: 'Line A',
  zone: 'Cooling',
  streamUrl: 'https://example.test/live',
  streamProtocol: 'hls',
  status: 'online',
}]

describe('AddCameraDialog', () => {
  it('switches to direct source mode and uses WebRTC as the default protocol', () => {
    const onAddDirectSource = vi.fn()

    render(
      <AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onClose={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('tab', { name: '영상 주소 직접 입력' }))
    fireEvent.change(screen.getByLabelText('영상 주소'), { target: { value: 'https://media.test/live.m3u8' } })
    fireEvent.change(screen.getByLabelText(/표시 제목/), { target: { value: '외부 설비' } })
    fireEvent.click(screen.getByRole('button', { name: '영상 추가' }))

    expect(onAddDirectSource).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://media.test/live.m3u8',
      protocol: 'webrtc',
      displayName: '외부 설비',
      playbackStatus: 'idle',
    }))
  })

  it('rejects an RTSP source with an HTTP URL', () => {
    const onAddDirectSource = vi.fn()

    render(
      <AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onClose={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('tab', { name: '영상 주소 직접 입력' }))
    fireEvent.change(screen.getByLabelText('프로토콜'), { target: { value: 'rtsp' } })
    fireEvent.change(screen.getByLabelText('영상 주소'), { target: { value: 'https://media.test/live' } })
    fireEvent.click(screen.getByRole('button', { name: '영상 추가' }))

    expect(screen.getByRole('alert')).toHaveTextContent('RTSP')
    expect(onAddDirectSource).not.toHaveBeenCalled()
  })

  it('prevents a duplicate temporary URL', () => {
    const onAddDirectSource = vi.fn()

    render(
      <AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        existingTemporaryUrls={['https://media.test/live.m3u8']}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onClose={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('tab', { name: '영상 주소 직접 입력' }))
    fireEvent.change(screen.getByLabelText('영상 주소'), { target: { value: 'https://media.test/live.m3u8' } })
    fireEvent.click(screen.getByRole('button', { name: '영상 추가' }))

    expect(screen.getByRole('alert')).toHaveTextContent('이미 추가')
    expect(onAddDirectSource).not.toHaveBeenCalled()
  })

  it('shows an already placed catalog camera but disables duplicate placement', () => {
    render(
      <AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[1]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onClose={vi.fn()}
      />
    )

    const cameraButton = screen.getByRole('button', { name: /Camera 1/ })
    expect(cameraButton).toBeDisabled()
    expect(cameraButton).toHaveTextContent('이미 추가됨')
  })
})
