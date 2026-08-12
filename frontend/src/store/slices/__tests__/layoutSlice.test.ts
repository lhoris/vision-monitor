import { describe, expect, it } from 'vitest'
import reducer, {
  fetchUserLayout,
  removeSubTab,
  removeTab,
  setActiveTab,
} from '../layoutSlice'
import type { Layout, LayoutState } from '@/types/layout'

const createLayout = (activeTab = 'tab-2'): Layout => ({
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
        {
          id: 'subtab-2',
          name: 'Equipment 2',
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

const stateWithLayout = (layout = createLayout()): LayoutState => ({
  layout,
  loading: false,
  error: null,
  activeTab: layout.activeTab,
})

describe('layoutSlice', () => {
  it('restores saved active tab when layout is fetched', () => {
    const state = reducer(undefined, fetchUserLayout.fulfilled(createLayout('tab-2'), '', 1))

    expect(state.activeTab).toBe('tab-2')
    expect(state.layout?.activeTab).toBe('tab-2')
  })

  it('falls back to first tab when fetched active tab is invalid', () => {
    const state = reducer(undefined, fetchUserLayout.fulfilled(createLayout('missing-tab'), '', 1))

    expect(state.activeTab).toBe('tab-1')
    expect(state.layout?.activeTab).toBe('tab-1')
  })

  it('keeps slice and layout active tab in sync', () => {
    const state = reducer(stateWithLayout(), setActiveTab('tab-1'))

    expect(state.activeTab).toBe('tab-1')
    expect(state.layout?.activeTab).toBe('tab-1')
  })

  it('selects a fallback active tab when removing the active tab', () => {
    const state = reducer(stateWithLayout(), removeTab('tab-2'))

    expect(state.activeTab).toBe('tab-1')
    expect(state.layout?.activeTab).toBe('tab-1')
    expect(state.layout?.tabs.map((tab) => tab.id)).toEqual(['tab-1'])
  })

  it('selects a fallback active subtab when removing the active subtab', () => {
    const state = reducer(
      stateWithLayout(),
      removeSubTab({ tabId: 'tab-1', subTabId: 'subtab-1' })
    )

    expect(state.layout?.tabs[0].activeSubTab).toBe('subtab-2')
    expect(state.layout?.tabs[0].subTabs.map((subTab) => subTab.id)).toEqual(['subtab-2'])
  })
})
