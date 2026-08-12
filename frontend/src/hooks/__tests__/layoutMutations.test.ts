import { describe, expect, it } from 'vitest'
import {
  addLayoutTab,
  removeLayoutTab,
  updateLayoutCameraPositions,
  updateLayoutGridConfig,
  withActiveTabFallback,
} from '../layoutMutations'
import type { Layout, Tab } from '@/types/layout'

const createLayout = (): Layout => ({
  id: 1,
  userId: 1,
  activeTab: 'tab-2',
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
})

const newTab: Tab = {
  id: 'tab-3',
  name: 'Line C',
  activeSubTab: 'subtab-c-1',
  createdAt: '2026-08-13T00:00:00.000Z',
  updatedAt: '2026-08-13T00:00:00.000Z',
  subTabs: [
    {
      id: 'subtab-c-1',
      name: 'Equipment 1',
      gridConfig: { rows: 1, cols: 1, layout: 'grid', gapSize: 8 },
      cameraPositions: [],
      createdAt: '2026-08-13T00:00:00.000Z',
      updatedAt: '2026-08-13T00:00:00.000Z',
    },
  ],
}

describe('layout mutation helpers', () => {
  it('keeps a valid active tab', () => {
    expect(withActiveTabFallback(createLayout()).activeTab).toBe('tab-2')
  })

  it('falls back when active tab is missing', () => {
    expect(withActiveTabFallback({ ...createLayout(), activeTab: 'missing' }).activeTab).toBe('tab-1')
  })

  it('adds a tab to the persisted layout payload', () => {
    const nextLayout = addLayoutTab(createLayout(), newTab)

    expect(nextLayout.tabs.map((tab) => tab.id)).toEqual(['tab-1', 'tab-2', 'tab-3'])
  })

  it('removes a tab and updates active tab fallback', () => {
    const nextLayout = removeLayoutTab(createLayout(), 'tab-2')

    expect(nextLayout.tabs.map((tab) => tab.id)).toEqual(['tab-1'])
    expect(nextLayout.activeTab).toBe('tab-1')
  })

  it('updates a subtab grid config immutably', () => {
    const layout = createLayout()
    const nextLayout = updateLayoutGridConfig(
      layout,
      'tab-1',
      'subtab-1',
      { rows: 4, cols: 4, layout: 'grid', gapSize: 12 }
    )

    expect(nextLayout.tabs[0].subTabs[0].gridConfig).toEqual({
      rows: 4,
      cols: 4,
      layout: 'grid',
      gapSize: 12,
    })
    expect(nextLayout).not.toBe(layout)
    expect(nextLayout.tabs[0]).not.toBe(layout.tabs[0])
  })

  it('updates camera positions for the selected subtab only', () => {
    const positions = [{ cameraId: 7, row: 1, col: 1, rowSpan: 1, colSpan: 1 }]
    const nextLayout = updateLayoutCameraPositions(createLayout(), 'tab-1', 'subtab-1', positions)

    expect(nextLayout.tabs[0].subTabs[0].cameraPositions).toEqual(positions)
    expect(nextLayout.tabs[1].subTabs[0].cameraPositions).toEqual([])
  })
})
