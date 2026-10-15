import { describe, expect, it } from 'vitest'
import { getUsedVideoSourceIds, updateTemporarySourcePositions } from '../GridContainer'
import type { CameraPosition } from '@/types/layout'
import { createMockLayout } from '@/test/fixtures/liveMonitoring'
import type { TemporaryVideoSource } from '@/types/streamPlayer'

describe('updateTemporarySourcePositions', () => {
  it('updates the matching temporary video source without requiring a selected cell', () => {
    const positions: CameraPosition[] = [{
      cameraId: -1,
      row: 0,
      col: 0,
      rowSpan: 1,
      colSpan: 1,
      displayName: 'Old Feed',
      temporarySourceId: 'temporary-1',
      source: {
        id: 'temporary-1',
        url: 'https://media.test/old.m3u8',
        protocol: 'hls',
        displayName: 'Old Feed',
        playbackStatus: 'idle',
      },
    }]
    const source: TemporaryVideoSource = {
      id: 'temporary-1',
      url: 'https://media.test/new.m3u8',
      protocol: 'hls',
      displayName: 'Updated Feed',
      playbackStatus: 'idle',
    }

    expect(updateTemporarySourcePositions(positions, -1, source)).toEqual([{
      ...positions[0],
      displayName: 'Updated Feed',
      temporarySourceId: 'temporary-1',
      source,
    }])
  })
})

describe('getUsedVideoSourceIds', () => {
  it('checks only the selected detail tab, not another detail tab in the same process', () => {
    const layout = createMockLayout('2026-10-16T00:00:00.000Z')
    layout.activeTab = 'tab-1'
    layout.tabs[0].subTabs[0].cameraPositions = [{
      cameraId: -1,
      row: 0,
      col: 0,
      rowSpan: 1,
      colSpan: 1,
      source: {
        id: 'video-source-10',
        url: 'https://media.test/managed.m3u8',
        protocol: 'hls',
        displayName: 'Managed feed',
        playbackStatus: 'idle',
      },
    }]
    layout.tabs[0].subTabs[1].cameraPositions = []

    expect(getUsedVideoSourceIds(layout, 'tab-1', layout.tabs[0].subTabs[0].id)).toEqual([10])
    expect(getUsedVideoSourceIds(layout, 'tab-1', layout.tabs[0].subTabs[1].id)).toEqual([])
  })

  it('does not treat an ordinary camera position as an added video source', () => {
    const layout = createMockLayout('2026-10-16T00:00:00.000Z')
    layout.tabs[0].subTabs[0].cameraPositions = [{
      cameraId: 10,
      row: 0,
      col: 0,
      rowSpan: 1,
      colSpan: 1,
    }]

    expect(getUsedVideoSourceIds(layout, 'tab-1', layout.tabs[0].subTabs[0].id)).toEqual([])
  })
})
