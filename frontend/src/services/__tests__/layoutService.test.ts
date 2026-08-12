import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Layout, Tab } from '@/types/layout'

vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const { apiClient } = await import('../api')
const { createDefaultLayout, layoutService } = await import('../layoutService')

const mockedApiClient = vi.mocked(apiClient)

const createLayout = (): Layout => ({
  id: 1,
  userId: 1,
  activeTab: 'tab-1',
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
  ],
})

const createTab = (): Tab => createLayout().tabs[0]

describe('layoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('creates the default development layout', () => {
    const layout = createDefaultLayout(12)

    expect(layout.userId).toBe(12)
    expect(layout.activeTab).toBe('tab-default')
    expect(layout.tabs[0].activeSubTab).toBe('subtab-default-1')
    expect(layout.tabs[0].subTabs[0].cameraPositions).toHaveLength(3)
  })

  it('returns layout data from getUserLayout', async () => {
    const layout = createLayout()
    mockedApiClient.get.mockResolvedValue({
      success: true,
      data: layout,
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    await expect(layoutService.getUserLayout(1)).resolves.toBe(layout)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/layouts/1')
  })

  it('falls back to default layout when getUserLayout fails', async () => {
    mockedApiClient.get.mockRejectedValue(new Error('Network failed'))

    const layout = await layoutService.getUserLayout(7)

    expect(layout?.userId).toBe(7)
    expect(layout?.activeTab).toBe('tab-default')
  })

  it('returns null when saveLayout fails', async () => {
    mockedApiClient.post.mockRejectedValue(new Error('Save failed'))

    await expect(layoutService.saveLayout(createLayout())).resolves.toBeNull()
  })

  it('returns null when updateLayout fails', async () => {
    mockedApiClient.put.mockRejectedValue(new Error('Update failed'))

    await expect(layoutService.updateLayout(1, createLayout())).resolves.toBeNull()
  })

  it('returns false when deleteLayout fails', async () => {
    mockedApiClient.delete.mockRejectedValue(new Error('Delete failed'))

    await expect(layoutService.deleteLayout(1)).resolves.toBe(false)
  })

  it('uses dedicated tab endpoints', async () => {
    const tab = createTab()
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: tab,
      timestamp: '2026-08-13T00:00:00.000Z',
    })
    mockedApiClient.put.mockResolvedValue({
      success: true,
      data: tab,
      timestamp: '2026-08-13T00:00:00.000Z',
    })
    mockedApiClient.delete.mockResolvedValue({
      success: true,
      timestamp: '2026-08-13T00:00:00.000Z',
    })

    await expect(layoutService.addTab(1, tab)).resolves.toBe(tab)
    await expect(layoutService.updateTab(1, 'tab-1', tab)).resolves.toBe(tab)
    await expect(layoutService.deleteTab(1, 'tab-1')).resolves.toBe(true)

    expect(mockedApiClient.post).toHaveBeenCalledWith('/layouts/1/tabs', tab)
    expect(mockedApiClient.put).toHaveBeenCalledWith('/layouts/1/tabs/tab-1', tab)
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/layouts/1/tabs/tab-1')
  })
})
