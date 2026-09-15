import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { AddCameraDialog } from '../AddCameraDialog'
import type { Camera } from '@/types/camera'
import type { VideoSource } from '@/types/videoSource'

const cameras: Camera[] = [{
  id: 1,
  name: 'Camera 1',
  location: 'Line A',
  zone: 'Cooling',
  streamUrl: 'https://example.test/live',
  streamProtocol: 'hls',
  status: 'online',
}]

const videoSources: VideoSource[] = [
  {
    id: 10,
    name: 'Managed Line Feed',
    url: 'https://managed.test/live.m3u8',
    protocol: 'HLS',
    location: 'Line B',
    zone: 'Packaging',
    status: 'ACTIVE',
  },
  {
    id: 11,
    name: 'Inactive Feed',
    url: 'https://managed.test/inactive.m3u8',
    protocol: 'HLS',
    location: 'Line C',
    zone: 'Storage',
    status: 'INACTIVE',
  },
]

describe('AddCameraDialog', () => {
  it('switches to direct source mode and uses WebRTC as the default protocol', () => {
    const onAddDirectSource = vi.fn()

    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Enter Video URL' }))
    fireEvent.change(screen.getByLabelText('Video URL'), { target: { value: 'https://media.test/live.m3u8' } })
    fireEvent.change(screen.getByLabelText(/Display title/), { target: { value: '외부 설비' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Video' }))

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
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Enter Video URL' }))
    fireEvent.change(screen.getByLabelText('Protocol'), { target: { value: 'rtsp' } })
    fireEvent.change(screen.getByLabelText('Video URL'), { target: { value: 'https://media.test/live' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Video' }))

    expect(screen.getByRole('alert')).toHaveTextContent('RTSP')
    expect(onAddDirectSource).not.toHaveBeenCalled()
  })

  it('prevents a duplicate temporary URL', () => {
    const onAddDirectSource = vi.fn()

    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        existingTemporaryUrls={['https://media.test/live.m3u8']}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Enter Video URL' }))
    fireEvent.change(screen.getByLabelText('Video URL'), { target: { value: 'https://media.test/live.m3u8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Video' }))

    expect(screen.getByRole('alert')).toHaveTextContent('already been added')
    expect(onAddDirectSource).not.toHaveBeenCalled()
  })

  it('shows an already placed catalog camera but disables duplicate placement', () => {
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[1]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    const cameraButton = screen.getByRole('button', { name: /Camera 1/ })
    expect(cameraButton).toBeDisabled()
    expect(cameraButton).toHaveTextContent('Already added')
  })

  it('shows active managed video sources in the catalog list and selects one as a video tile source', () => {
    const onAddDirectSource = vi.fn()

    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    expect(screen.getByRole('button', { name: /Managed Line Feed/ })).toHaveTextContent('Managed source')
    expect(screen.queryByText('Inactive Feed')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Managed Line Feed/ }))

    expect(onAddDirectSource).toHaveBeenCalledWith({
      id: 'video-source-10',
      url: 'https://managed.test/live.m3u8',
      protocol: 'hls',
      displayName: 'Managed Line Feed',
      playbackStatus: 'idle',
    })
  })

  it('disables a managed video source when the same URL is already placed', () => {
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[]}
        existingTemporaryUrls={['https://managed.test/live.m3u8']}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    const sourceButton = screen.getByRole('button', { name: /Managed Line Feed/ })
    expect(sourceButton).toBeDisabled()
    expect(sourceButton).toHaveTextContent('Already added')
  })
})
