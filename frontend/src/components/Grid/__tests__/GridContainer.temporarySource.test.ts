import { describe, expect, it } from 'vitest'
import { getUsedVideoSourceIds, updateTemporarySourcePositions } from '../GridContainer'
import type { CameraPosition } from '@/types/layout'
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
  it('does not treat an unrendered camera position as an added video source', () => {
    const positions: CameraPosition[] = [
      { cameraId: 10, row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      {
        cameraId: -1,
        row: 0,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        source: {
          id: 'video-source-11',
          url: 'https://media.test/managed.m3u8',
          protocol: 'hls',
          displayName: 'Managed feed',
          playbackStatus: 'idle',
        },
      },
    ]

    expect(getUsedVideoSourceIds(positions)).toEqual([11])
  })
})
