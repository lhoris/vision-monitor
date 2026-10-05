import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CameraFocus from '../CameraFocus'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/services/api', () => ({ apiClient: { get, post } }))

vi.mock('@/components/StreamPlayer/StreamPlayerComponent', () => ({
  StreamPlayerComponent: ({ source }: { source: { url: string; protocol: string; label?: string } }) => (
    <div data-testid="focus-playback-player">
      {source.protocol}:{source.url}:{source.label}
    </div>
  ),
}))

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  )
}

function renderRoute(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/live/cameras/:cameraId"
          element={
            <>
              <CameraFocus />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('CameraFocus page shell', () => {
  beforeEach(() => {
    get.mockImplementation((url: string) => {
      if (url === '/cameras') {
        return Promise.resolve({
          data: [
            {
              id: 1,
              name: 'Entry Zone CAM-01',
              location: 'Line 1',
              zone: 'Entry Zone',
              streamUrl: 'https://media.test/camera-1.m3u8',
              streamProtocol: 'hls',
              status: 'online',
              recordingEnabled: true,
            },
            {
              id: 2,
              name: 'Entry Zone CAM-02',
              location: 'Line 1',
              zone: 'Entry Zone',
              streamUrl: 'https://media.test/camera-2.m3u8',
              streamProtocol: 'hls',
              status: 'online',
              recordingEnabled: true,
            },
          ],
        })
      }
      if (url === '/cameras/1/playback') {
        return Promise.resolve({
          success: true,
          data: {
            cameraId: 1,
            playbackUrl: 'https://media.test/playback/camera-1.m3u8',
            playbackProtocol: 'hls',
            sessionId: 'session-1',
            expiresAt: '2026-08-15T09:15:00+09:00',
            availableFrom: '2026-08-15T08:00:00+09:00',
            availableTo: '2026-08-15T09:00:00+09:00',
            seekable: true,
            preRollSeconds: 10,
            timelineSegments: [],
          },
          timestamp: '2026-08-15T09:00:00+09:00',
        })
      }
      const match = url.match(/^\/cameras\/(\d+)$/)
      if (!match) return Promise.reject(new Error('offline'))
      const id = Number(match[1])
      return Promise.resolve({
        data: {
          id,
          name: id === 1 ? 'Entry Zone CAM-01' : 'Entry Zone CAM-02',
          location: 'Line 1',
          zone: 'Entry Zone',
          streamUrl: `https://media.test/camera-${id}.m3u8`,
          streamProtocol: 'hls',
          status: 'online',
          recordingEnabled: true,
          lastSeen: '2026-10-05T00:00:00Z',
        },
      })
    })
    post.mockImplementation(async (url: string) => {
      const queryCode = decodeURIComponent(url.split('/').at(-2) ?? '')
      const rows = queryCode === 'camera.info'
        ? [{ label: 'Video Name', value: 'Entry Zone CAM-01' }, { label: 'Process', value: 'Cooling' }, { label: 'Zone', value: 'Entry Zone' }]
        : queryCode === 'camera.status'
          ? [{ label: 'Status', value: 'online' }]
          : []
      return { data: { queryId: queryCode, schema: [], rows, fetchedAt: '2026-10-05T00:00:00Z' } }
    })
  })

  it('renders live focus view with the source grid camera list', async () => {
    renderRoute('/live/cameras/1?mode=live&cameraIds=1%2C2')

    expect(screen.getByRole('heading', { name: '화면 확대 보기' })).toBeInTheDocument()
    expect(await screen.findByRole('tablist', { name: '카메라 목록' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /라이브로 돌아가기|Back to Live/ })).toBeInTheDocument()
    expect(await screen.findByText('Entry Zone CAM-01')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Entry Zone CAM-01' })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByRole('tab', { name: 'Entry Zone CAM-02' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Camera 7' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '실시간' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '녹화' })).toHaveAttribute('aria-selected', 'false')
  })

  it('renders temporary video sources in the focus view', async () => {
    const temporarySources = encodeURIComponent(JSON.stringify({
      '-1': {
        id: 'temporary-1',
        url: 'https://media.test/live.m3u8',
        protocol: 'hls',
        displayName: 'External Feed',
        playbackStatus: 'idle',
      },
    }))
    renderRoute(`/live/cameras/-1?mode=live&cameraIds=-1&temporarySources=${temporarySources}`)

    expect(await screen.findByRole('tab', { name: 'External Feed' })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByTestId('focus-playback-player')).toHaveTextContent('hls:https://media.test/live.m3u8')
  })

  it('applies renamed camera titles from the focus route query', async () => {
    const cameraNames = encodeURIComponent(JSON.stringify({ 1: '공냉대 진입부' }))
    renderRoute(`/live/cameras/1?mode=live&cameraIds=1%2C2&cameraNames=${cameraNames}`)

    expect(await screen.findByRole('tab', { name: '공냉대 진입부' })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByRole('tab', { name: 'Entry Zone CAM-02' })).toBeInTheDocument()
    expect(screen.getAllByText('공냉대 진입부').length).toBeGreaterThanOrEqual(1)
  })

  it('shows a manual test alert toast using the entered message', async () => {
    renderRoute('/live/cameras/2?mode=live&cameraIds=1%2C2')

    fireEvent.click(screen.getByRole('button', { name: '테스트 알람' }))
    expect(screen.getByRole('dialog', { name: '테스트 알람 메시지' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('경고 메시지'), {
      target: { value: '[사용자 테스트] 냉각 구간 속도 이상' },
    })
    fireEvent.click(screen.getByRole('button', { name: '띄우기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('[사용자 테스트] 냉각 구간 속도 이상')
    expect(screen.queryByRole('dialog', { name: '테스트 알람 메시지' })).not.toBeInTheDocument()
  })

  it('shows a manual test alert for a temporary video source', async () => {
    const temporarySources = encodeURIComponent(JSON.stringify({
      '-1': {
        id: 'temporary-1',
        url: 'https://media.test/live.m3u8',
        protocol: 'hls',
        displayName: 'External Feed',
        playbackStatus: 'idle',
      },
    }))
    renderRoute(`/live/cameras/-1?mode=live&cameraIds=-1&temporarySources=${temporarySources}`)

    fireEvent.click(screen.getByRole('button', { name: '테스트 알람' }))
    fireEvent.click(screen.getByRole('button', { name: '띄우기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('[테스트 경고] Entry Zone 치입불 발생 중')
  })

  it('changes the focused camera when a camera tab is selected', async () => {
    renderRoute('/live/cameras/1?mode=live&tabId=tab-2&subTabId=subtab-b-1&cameraIds=1%2C2')

    fireEvent.click(await screen.findByRole('tab', { name: 'Entry Zone CAM-02' }))

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/live/cameras/2?mode=live&tabId=tab-2&subTabId=subtab-b-1&cameraIds=1%2C2'
    )
    expect(await screen.findByRole('tab', { name: 'Entry Zone CAM-02' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders recording playback session for selected event route state', async () => {
    renderRoute('/live/cameras/1?mode=recording&eventId=50001')

    expect(screen.getByRole('tab', { name: '녹화' })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByTestId('focus-playback-player')).toHaveTextContent(
      'hls:https://media.test/playback/camera-1.m3u8'
    )
  })

  it('updates the route query when recording tab is selected', async () => {
    renderRoute('/live/cameras/1?mode=live')

    fireEvent.click(screen.getByRole('tab', { name: '녹화' }))

    expect(await screen.findByTestId('location')).toHaveTextContent('/live/cameras/1?mode=recording')
  })

  it('clears a selected event when moving to another focused camera', async () => {
    renderRoute('/live/cameras/1?mode=recording&eventId=50001')

    fireEvent.click(await screen.findByRole('tab', { name: 'Entry Zone CAM-02' }))

    expect(await screen.findByTestId('location')).toHaveTextContent('/live/cameras/2?mode=recording')
    expect(screen.queryByTestId('location')).not.toHaveTextContent('eventId=50001')
  })
})
