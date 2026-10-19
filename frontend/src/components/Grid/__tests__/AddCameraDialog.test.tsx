import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
}, {
  id: 10,
  name: 'Managed Line Feed',
  location: 'Line B',
  zone: 'Packaging',
  streamUrl: 'https://managed.test/live.m3u8',
  streamProtocol: 'hls',
  status: 'online',
  modelProcessId: 2,
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
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('switches to direct source mode and uses WebRTC as the default protocol', () => {
    const onAddDirectSource = vi.fn()

    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onRemoveVideoSource={vi.fn()}
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

  it('does not offer RTSP for direct video sources', () => {
    const onAddDirectSource = vi.fn()

    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={onAddDirectSource}
        onRemoveVideoSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Enter Video URL' }))

    expect(screen.getByLabelText('Protocol')).toHaveTextContent('WebRTC')
    expect(screen.getByLabelText('Protocol')).toHaveTextContent('HLS')
    expect(screen.getByLabelText('Protocol')).not.toHaveTextContent('RTSP')
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
        onRemoveVideoSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Enter Video URL' }))
    fireEvent.change(screen.getByLabelText('Video URL'), { target: { value: 'https://media.test/live.m3u8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Video' }))

    expect(screen.getByRole('alert')).toHaveTextContent('already been added')
    expect(onAddDirectSource).not.toHaveBeenCalled()
  })

  it('does not show mock cameras in the video source catalog', () => {
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        usedCameraIds={[1]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onRemoveVideoSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    expect(screen.queryByRole('button', { name: /Camera 1/ })).not.toBeInTheDocument()
    expect(screen.getByText('No search results.')).toBeInTheDocument()
  })

  it('shows active managed video sources in the catalog list and selects one as a managed camera', () => {
    const onSelectCamera = vi.fn()
    const onAddDirectSource = vi.fn()

    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[]}
        onSelectCamera={onSelectCamera}
        onAddDirectSource={onAddDirectSource}
        onRemoveVideoSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    expect(screen.getByRole('button', { name: /Managed Line Feed/ })).toHaveTextContent('Managed source')
    expect(screen.queryByText('Inactive Feed')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Managed Line Feed/ }))

    expect(onSelectCamera).toHaveBeenCalledWith(expect.objectContaining({ id: 10, modelProcessId: 2 }))
  })

  it('hides legacy RTSP managed video sources from the catalog list', () => {
    const legacyRtspSource = {
      id: 12,
      name: 'Legacy RTSP Feed',
      url: 'rtsp://managed.test/live',
      protocol: 'RTSP' as unknown as VideoSource['protocol'],
      location: 'Line D',
      zone: 'Legacy',
      status: 'ACTIVE' as const,
    }

    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={[...videoSources, legacyRtspSource]}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onRemoveVideoSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    expect(screen.queryByText('Legacy RTSP Feed')).not.toBeInTheDocument()
  })

  it('disables a managed video source when the same URL is already placed', () => {
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[10]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    const sourceButton = screen.getByRole('button', { name: /Managed Line Feed/ })
    expect(sourceButton).toHaveTextContent('Already added')
  })

  it('removes an already added managed source from the current detail tab by context menu', () => {
    const onRemoveVideoSource = vi.fn()
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[10]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onRemoveVideoSource={onRemoveVideoSource}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    fireEvent.contextMenu(screen.getByRole('button', { name: /Managed Line Feed/ }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remove video' }))

    expect(onRemoveVideoSource).toHaveBeenCalledWith(10)
  })

  it('explains how to remove an already added source when clicked', () => {
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[10]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onRemoveVideoSource={vi.fn()}
        onClose={vi.fn()}
      /></I18nextProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Managed Line Feed/ }))

    expect(screen.getByRole('status')).toHaveTextContent('already added')
  })

  it('closes when clicking the backdrop but not the dialog content', () => {
    const onClose = vi.fn()
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onRemoveVideoSource={vi.fn()}
        onClose={onClose}
      /></I18nextProvider>
    )

    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(dialog.parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps the dialog open when clicking outside an open context menu', () => {
    const onClose = vi.fn()
    render(
      <I18nextProvider i18n={i18n}><AddCameraDialog
        isOpen
        cameras={cameras}
        videoSources={videoSources}
        usedCameraIds={[10]}
        onSelectCamera={vi.fn()}
        onAddDirectSource={vi.fn()}
        onRemoveVideoSource={vi.fn()}
        onClose={onClose}
      /></I18nextProvider>
    )

    fireEvent.contextMenu(screen.getByRole('button', { name: /Managed Line Feed/ }))
    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement)

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
