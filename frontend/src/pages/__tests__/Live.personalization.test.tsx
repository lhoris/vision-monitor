import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import layoutReducer from '@/store/slices/layoutSlice'
import authReducer, { loginUser, logoutUser } from '@/store/slices/authSlice'
import type { Layout } from '@/types/layout'

vi.mock('@/hooks/usePersistLayout', () => ({
  usePersistLayout: vi.fn(),
}))

vi.mock('@/components/Grid', () => ({
  GridContainer: () => <div data-testid="grid-container" />,
}))

vi.mock('@/components/Grid/LayoutPersistStatus', () => ({
  default: () => <div data-testid="layout-persist-status" />,
}))

vi.mock('@/services/layoutService', async () => {
  const actual = await vi.importActual<typeof import('@/services/layoutService')>('@/services/layoutService')
  return {
    ...actual,
    layoutService: {
      ...actual.layoutService,
      getMyLayout: vi.fn(),
      saveMyLayout: vi.fn(),
      saveLocalLayout: vi.fn(),
    },
  }
})

const { layoutService } = await import('@/services/layoutService')
const { Live } = await import('../Live')
const mockedLayoutService = vi.mocked(layoutService)

function createLayout(activeTab = 'tab-1'): Layout {
  return {
    id: 1,
    userId: 1,
    activeTab,
    createdAt: '2026-08-25T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
    tabs: [
      {
        id: activeTab,
        name: 'Line',
        activeSubTab: 'subtab-1',
        createdAt: '2026-08-25T00:00:00.000Z',
        updatedAt: '2026-08-25T00:00:00.000Z',
        subTabs: [
          {
            id: 'subtab-1',
            name: 'Equipment',
            gridConfig: { rows: 2, cols: 2, layout: 'grid', gapSize: 8 },
            cameraPositions: [],
            createdAt: '2026-08-25T00:00:00.000Z',
            updatedAt: '2026-08-25T00:00:00.000Z',
          },
        ],
      },
    ],
  }
}

function createStore() {
  return configureStore({
    reducer: {
      layout: layoutReducer,
      auth: authReducer,
    },
  })
}

describe('Live personalization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedLayoutService.getMyLayout.mockResolvedValue(createLayout())
  })

  it('fetches the current user layout before rendering the grid', async () => {
    const store = createStore()
    store.dispatch(loginUser.fulfilled({
      user: { id: 1, username: 'admin', role: 'admin', permissions: ['admin:access'] },
      token: 'token',
    }, '', { username: 'admin', password: 'admin' }))

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Live />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => expect(mockedLayoutService.getMyLayout).toHaveBeenCalledTimes(1))
    expect(await screen.findByTestId('grid-container')).toBeInTheDocument()
    expect(store.getState().layout.restoredForUser).toBe('admin')
  })

  it('clears layout state when the user logs out', () => {
    const store = createStore()
    store.dispatch(loginUser.fulfilled({
      user: { id: 1, username: 'admin', role: 'admin', permissions: ['admin:access'] },
      token: 'token',
    }, '', { username: 'admin', password: 'admin' }))

    store.dispatch(logoutUser.fulfilled(undefined, ''))

    expect(store.getState().layout.layout).toBeNull()
    expect(store.getState().layout.restoredForUser).toBeNull()
  })
})
