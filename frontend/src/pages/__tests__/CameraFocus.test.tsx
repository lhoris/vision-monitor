import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CameraFocus from '../CameraFocus'
import { store } from '@/store'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/services/api', () => ({ apiClient: { get, post } }))
vi.mock('@/components/StreamPlayer/StreamPlayerComponent', () => ({ StreamPlayerComponent: ({ source }: { source: { url: string; protocol: string; label?: string } }) => <div data-testid="focus-playback-player">{source.protocol}:{source.url}:{source.label}</div> }))

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

function renderRoute(initialEntry: string) {
  render(<MemoryRouter initialEntries={[initialEntry]}><Routes><Route path="/live/cameras/:cameraId" element={<Provider store={store}><CameraFocus /><LocationProbe /></Provider>} /></Routes></MemoryRouter>)
}

describe('CameraFocus page shell', () => {
  beforeEach(() => {
    get.mockImplementation((url: string) => {
      if (url === '/cameras') return Promise.resolve({ data: [
        { id: 1, name: 'Entry Zone CAM-01', location: 'Line 1', zone: 'Entry Zone', streamUrl: 'https://media.test/camera-1.m3u8', streamProtocol: 'hls', modelProcessId: 101, status: 'online', recordingEnabled: true },
        { id: 2, name: 'Entry Zone CAM-02', location: 'Line 1', zone: 'Entry Zone', streamUrl: 'https://media.test/camera-2.m3u8', streamProtocol: 'hls', modelProcessId: 102, status: 'online', recordingEnabled: true },
      ] })
      if (url === '/cameras/1/playback') return Promise.resolve({ success: true, data: { cameraId: 1, playbackUrl: 'https://media.test/playback/camera-1.m3u8', playbackProtocol: 'hls', sessionId: 'session-1', expiresAt: '2026-08-15T09:15:00+09:00', availableFrom: '2026-08-15T08:00:00+09:00', availableTo: '2026-08-15T09:00:00+09:00', seekable: true, preRollSeconds: 10, timelineSegments: [] }, timestamp: '2026-08-15T09:00:00+09:00' })
      if (url === '/events/50001') return Promise.resolve({ data: { id: 50001, cameraId: 1, type: 'PERSON_DETECTED', severity: 'warning', description: 'Entry Zone alarm', timestamp: '2026-11-17T07:29:31', acknowledged: false } })
      const match = url.match(/^\/cameras\/(\d+)$/)
      if (!match) return Promise.reject(new Error('offline'))
      const id = Number(match[1])
      return Promise.resolve({ data: { id, name: id === 1 ? 'Entry Zone CAM-01' : 'Entry Zone CAM-02', location: 'Line 1', zone: 'Entry Zone', streamUrl: `https://media.test/camera-${id}.m3u8`, streamProtocol: 'hls', modelProcessId: id === 1 ? 101 : 102, status: 'online', recordingEnabled: true, lastSeen: '2026-10-05T00:00:00Z' } })
    })
    post.mockResolvedValue({ data: { queryId: 'camera.info', schema: [], rows: [], fetchedAt: '2026-10-05T00:00:00Z' } })
  })

  it('renders the recording player with a single main timeline', async () => {
    renderRoute('/live/cameras/1?mode=recording&eventId=50001')

    expect(await screen.findByTestId('focus-recording-video')).toHaveAttribute('src', expect.stringContaining('/playback/video6.mp4'))
    await waitFor(() => expect(screen.getByRole('slider', { name: '녹화 재생 위치' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '현재 구간 다시 재생' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: '24시간 녹화 개요' })).not.toBeInTheDocument()
  })

  it('updates the route query when recording tab is selected', async () => {
    renderRoute('/live/cameras/1?mode=live')
    fireEvent.click(screen.getByRole('tab', { name: '녹화' }))
    expect(await screen.findByTestId('location')).toHaveTextContent('/live/cameras/1?mode=recording')
  })

  it('changes the focused camera when a camera tab is selected', async () => {
    renderRoute('/live/cameras/1?mode=live&cameraIds=1%2C2')
    fireEvent.click(await screen.findByRole('tab', { name: 'Entry Zone CAM-02' }))
    expect(await screen.findByTestId('location')).toHaveTextContent('/live/cameras/2?mode=live')
  })
})
