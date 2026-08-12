import { describe, expect, it } from 'vitest'
import { createMockCameras, createMockLayout } from '../liveMonitoring'

describe('live monitoring mock data', () => {
  it('creates seven go2rtc camera stream entries by default', () => {
    const cameras = createMockCameras()

    expect(cameras).toHaveLength(7)
    expect(cameras[0]).toMatchObject({
      id: 1,
      name: 'Camera 1',
      streamUrl: 'http://220.81.187.50:1984/stream.html?src=video_high1',
      streamProtocol: 'webrtc',
      status: 'online',
    })
    expect(cameras[6].streamUrl).toBe('http://220.81.187.50:1984/stream.html?src=video_high7')
  })

  it('creates the current Equipment 1 and Equipment 2 layout', () => {
    const layout = createMockLayout('2026-08-13T00:00:00.000Z')
    const lineA = layout.tabs[0]

    expect(lineA.name).toBe('Production Line A')
    expect(lineA.subTabs.map((subTab) => subTab.name)).toEqual(['Equipment 1', 'Equipment 2'])
    expect(lineA.subTabs[0].cameraPositions).toHaveLength(7)
    expect(lineA.subTabs[1].cameraPositions).toHaveLength(7)
    expect(lineA.subTabs[0].cameraPositions).not.toBe(lineA.subTabs[1].cameraPositions)
  })
})
