import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GridContainer } from '../GridContainer'
import { createMockCameras, createMockLayout } from '@/mocks/liveMonitoring'
import { store } from '@/store'
import { fetchUserLayout } from '@/store/slices/layoutSlice'

vi.mock('@/components/StreamPlayer/LiveStreamPlayer', () => ({
  LiveStreamPlayer: () => <div data-testid="live-stream-player" />,
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

describe('GridContainer focus routing', () => {
  it('passes only the current subtab camera ids to the focus view', async () => {
    const layout = createMockLayout('2026-08-15T00:00:00.000Z')
    layout.activeTab = 'tab-2'

    store.dispatch(fetchUserLayout.fulfilled(layout, '', 1))

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/live']}>
          <Routes>
            <Route
              path="/live"
              element={
                <>
                  <GridContainer userId={1} cameras={createMockCameras()} />
                  <LocationProbe />
                </>
              }
            />
            <Route path="/live/cameras/:cameraId" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Camera 1/ }))

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/live/cameras/1?mode=live&tabId=tab-2&subTabId=subtab-b-1&cameraIds=1%2C2'
    )
  })

  it('passes renamed camera titles to the focus view route', async () => {
    const layout = createMockLayout('2026-08-15T00:00:00.000Z')
    layout.activeTab = 'tab-2'

    store.dispatch(fetchUserLayout.fulfilled(layout, '', 1))

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/live']}>
          <Routes>
            <Route
              path="/live"
              element={
                <>
                  <GridContainer userId={1} cameras={createMockCameras()} />
                  <LocationProbe />
                </>
              }
            />
            <Route path="/live/cameras/:cameraId" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    fireEvent.contextMenu(screen.getByRole('heading', { name: 'Camera 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }))
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '공냉대 진입부' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    fireEvent.click(screen.getByRole('button', { name: '공냉대 진입부 확대 보기' }))

    const locationText = (await screen.findByTestId('location')).textContent ?? ''
    expect(locationText).toContain('/live/cameras/1?')
    expect(locationText).toContain('cameraIds=1%2C2')
    expect(locationText).toContain('cameraNames=')
    const routeSearch = locationText.slice(locationText.indexOf('?'))
    expect(new URLSearchParams(routeSearch).get('cameraNames')).toContain('"1":"공냉대 진입부"')
  })
})
