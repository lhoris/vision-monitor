import type { CameraPosition, GridConfig, Layout, Tab } from '@/types/layout'

export function withActiveTabFallback(layout: Layout): Layout {
  const activeTabExists = layout.tabs.some((tab) => tab.id === layout.activeTab)
  return {
    ...layout,
    activeTab: activeTabExists ? layout.activeTab : layout.tabs[0]?.id || '',
  }
}

export function addLayoutTab(layout: Layout, tab: Tab): Layout {
  return withActiveTabFallback({
    ...layout,
    tabs: [...layout.tabs, tab],
  })
}

export function removeLayoutTab(layout: Layout, tabId: string): Layout {
  return withActiveTabFallback({
    ...layout,
    tabs: layout.tabs.filter((tab) => tab.id !== tabId),
  })
}

export function updateLayoutGridConfig(
  layout: Layout,
  tabId: string,
  subTabId: string,
  config: GridConfig
): Layout {
  return {
    ...layout,
    tabs: layout.tabs.map((tab) => {
      if (tab.id !== tabId) return tab

      return {
        ...tab,
        subTabs: tab.subTabs.map((subTab) =>
          subTab.id === subTabId ? { ...subTab, gridConfig: config } : subTab
        ),
      }
    }),
  }
}

export function updateLayoutCameraPositions(
  layout: Layout,
  tabId: string,
  subTabId: string,
  positions: CameraPosition[]
): Layout {
  return {
    ...layout,
    tabs: layout.tabs.map((tab) => {
      if (tab.id !== tabId) return tab

      return {
        ...tab,
        subTabs: tab.subTabs.map((subTab) =>
          subTab.id === subTabId ? { ...subTab, cameraPositions: positions } : subTab
        ),
      }
    }),
  }
}
