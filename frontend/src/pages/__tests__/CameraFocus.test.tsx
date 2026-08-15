import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CameraFocus from '../CameraFocus'

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
  it('renders live focus view with the source grid camera list', async () => {
    renderRoute('/live/cameras/1?mode=live&cameraIds=1%2C2')

    expect(screen.getByRole('heading', { name: '카메라 집중 보기' })).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: '카메라 목록' })).toBeInTheDocument()
    expect(await screen.findByText('Entry Zone CAM-01')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Camera 1' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Camera 2' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Camera 7' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '실시간' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '녹화' })).toHaveAttribute('aria-selected', 'false')
  })

  it('changes the focused camera when a camera tab is selected', async () => {
    renderRoute('/live/cameras/1?mode=live&tabId=tab-2&subTabId=subtab-b-1&cameraIds=1%2C2')

    fireEvent.click(screen.getByRole('tab', { name: 'Camera 2' }))

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/live/cameras/2?mode=live&tabId=tab-2&subTabId=subtab-b-1&cameraIds=1%2C2'
    )
    expect(await screen.findByRole('tab', { name: 'Camera 2' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders recording playback session for selected event route state', async () => {
    renderRoute('/live/cameras/1?mode=recording&eventId=50001')

    expect(screen.getByRole('tab', { name: '녹화' })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByTestId('focus-playback-player')).toHaveTextContent(
      'hls:https://media.example.local/playback/session/playback-cam-1-20260815-0800/index.m3u8'
    )
  })

  it('updates the route query when recording tab is selected', async () => {
    renderRoute('/live/cameras/1?mode=live')

    fireEvent.click(screen.getByRole('tab', { name: '녹화' }))

    expect(await screen.findByTestId('location')).toHaveTextContent('/live/cameras/1?mode=recording')
  })

  it('clears a selected event when moving to another focused camera', async () => {
    renderRoute('/live/cameras/1?mode=recording&eventId=50001')

    fireEvent.click(screen.getByRole('tab', { name: 'Camera 2' }))

    expect(await screen.findByTestId('location')).toHaveTextContent('/live/cameras/2?mode=recording')
    expect(screen.queryByTestId('location')).not.toHaveTextContent('eventId=50001')
  })
})
