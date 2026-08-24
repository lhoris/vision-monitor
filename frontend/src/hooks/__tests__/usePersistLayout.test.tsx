import { Provider } from 'react-redux'
import { act, render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import layoutReducer, { fetchUserLayout, setActiveTab } from '@/store/slices/layoutSlice'
import authReducer, { loginUser } from '@/store/slices/authSlice'
import { usePersistLayout } from '../usePersistLayout'
import type { Layout } from '@/types/layout'

vi.mock('@/services/layoutService', async () => {
  const actual = await vi.importActual<typeof import('@/services/layoutService')>('@/services/layoutService')
  return {
    ...actual,
    layoutService: {
      ...actual.layoutService,
      saveMyLayout: vi.fn(),
      saveLocalLayout: vi.fn(),
    },
  }
})

const { layoutService } = await import('@/services/layoutService')
const mockedLayoutService = vi.mocked(layoutService)

function createLayout(activeTab = 'tab-1'): Layout {
  return {
    id: 1,
    userId: 1,
    activeTab,
    createdAt: '2026-08-13T00:00:00.000Z',
    updatedAt: '2026-08-13T00:00:00.000Z',
    tabs: [
      {
        id: 'tab-1',
        name: 'Line A',
        activeSubTab: 'subtab-1',
        createdAt: '2026-08-13T00:00:00.000Z',
        updatedAt: '2026-08-13T00:00:00.000Z',
        subTabs: [
          {
            id: 'subtab-1',
            name: 'Equipment 1',
            gridConfig: { rows: 3, cols: 3, layout: 'grid', gapSize: 8 },
            cameraPositions: [],
            createdAt: '2026-08-13T00:00:00.000Z',
            updatedAt: '2026-08-13T00:00:00.000Z',
          },
        ],
      },
      {
        id: 'tab-2',
        name: 'Line B',
        activeSubTab: 'subtab-b-1',
        createdAt: '2026-08-13T00:00:00.000Z',
        updatedAt: '2026-08-13T00:00:00.000Z',
        subTabs: [
          {
            id: 'subtab-b-1',
            name: 'Equipment 1',
            gridConfig: { rows: 2, cols: 2, layout: 'grid', gapSize: 8 },
            cameraPositions: [],
            createdAt: '2026-08-13T00:00:00.000Z',
            updatedAt: '2026-08-13T00:00:00.000Z',
          },
        ],
      },
    ],
  }
}

function PersistHarness() {
  usePersistLayout(20)
  return null
}

function createStore() {
  return configureStore({
    reducer: {
      layout: layoutReducer,
      auth: authReducer,
    },
  })
}

describe('usePersistLayout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockedLayoutService.saveMyLayout.mockResolvedValue(createLayout('tab-2'))
  })

  it('saves changed layout after debounce', async () => {
    const store = createStore()
    store.dispatch(loginUser.fulfilled({
      user: { id: 1, username: 'admin', role: 'admin', permissions: ['admin:access'] },
      token: 'token',
    }, '', { username: 'admin', password: 'admin' }))
    store.dispatch(fetchUserLayout.fulfilled(createLayout('tab-1'), '', 1))

    render(
      <Provider store={store}>
        <PersistHarness />
      </Provider>
    )

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      store.dispatch(setActiveTab('tab-2'))
      await Promise.resolve()
    })

    act(() => {
      vi.advanceTimersByTime(25)
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockedLayoutService.saveMyLayout).toHaveBeenCalledTimes(1)
    expect(mockedLayoutService.saveMyLayout).toHaveBeenCalledWith(expect.objectContaining({ activeTab: 'tab-2' }))
  })

  it('keeps layout state when save fails', async () => {
    mockedLayoutService.saveMyLayout.mockResolvedValue(null)
    const store = createStore()
    const layout = createLayout('tab-1')
    store.dispatch(loginUser.fulfilled({
      user: { id: 1, username: 'admin', role: 'admin', permissions: ['admin:access'] },
      token: 'token',
    }, '', { username: 'admin', password: 'admin' }))
    store.dispatch(fetchUserLayout.fulfilled(layout, '', 1))

    render(
      <Provider store={store}>
        <PersistHarness />
      </Provider>
    )

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      store.dispatch(setActiveTab('tab-2'))
      await Promise.resolve()
    })

    act(() => {
      vi.advanceTimersByTime(25)
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(store.getState().layout.layout?.activeTab).toBe('tab-2')
    expect(store.getState().layout.persistStatus).toBe('saveFailed')
  })
})
