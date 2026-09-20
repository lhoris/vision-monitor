import { describe, expect, it } from 'vitest'
import { reconcileLegacyCameraIds, videoSourceToCamera, videoSourcesToCameras } from '../videoSourceService'
import { createMockLayout } from '@/mocks/liveMonitoring'
import type { VideoSource } from '@/types/videoSource'

const activeSource: VideoSource = {
  id: 101,
  name: 'Entry Camera',
  url: 'http://localhost:8889/sample001/whep',
  protocol: 'WEBRTC',
  location: '4선재',
  zone: '가열',
  status: 'ACTIVE',
}

describe('video source camera adapter', () => {
  it('maps a registered WebRTC source to the live camera contract', () => {
    expect(videoSourceToCamera(activeSource)).toEqual({
      id: 101,
      name: 'Entry Camera',
      location: '4선재',
      zone: '가열',
      streamUrl: 'http://localhost:8889/sample001/whep',
      streamProtocol: 'webrtc',
      status: 'online',
    })
  })

  it('keeps inactive registered sources visible as offline cameras', () => {
    expect(videoSourcesToCameras([{ ...activeSource, status: 'INACTIVE' }])[0].status).toBe('offline')
  })

  it('preserves the source order used by the video management grid', () => {
    const sources = [activeSource, { ...activeSource, id: 102, name: 'Cooling Camera' }]

    expect(videoSourcesToCameras(sources).map((camera) => camera.id)).toEqual([101, 102])
  })

  it('migrates legacy fixture camera ids to persisted source ids', () => {
    const layout = createMockLayout()
    const sources = Array.from({ length: 9 }, (_, index) => ({
      ...activeSource,
      id: index + 2,
      name: `sample00${index + 1}`,
    }))

    const reconciled = reconcileLegacyCameraIds(layout, sources)
    expect(reconciled.tabs[0].subTabs[0].cameraPositions.slice(0, 3).map((position) => position.cameraId)).toEqual([2, 3, 4])
  })
})
