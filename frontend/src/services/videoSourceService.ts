import { apiClient } from './api'
import { getResponseData, withServiceFallback } from './serviceUtils'
import type { ApiResponse } from '@/types/api'
import type { Camera } from '@/types/camera'
import type { Layout } from '@/types/layout'
import type { VideoSource, VideoSourceInput } from '@/types/videoSource'

export function videoSourceToCamera(source: VideoSource): Camera {
  return {
    id: source.id,
    name: source.name,
    location: source.location || '-',
    zone: source.zone || '-',
    streamUrl: source.url,
    streamProtocol: source.protocol.toLowerCase() as Camera['streamProtocol'],
    status: source.status === 'ACTIVE' ? 'online' : 'offline',
  }
}

export function videoSourcesToCameras(sources: VideoSource[]): Camera[] {
  return sources.map(videoSourceToCamera)
}

/**
 * Older local layouts used 1-based fixture positions instead of persisted
 * video-source IDs. Translate that legacy shape once the real catalog loads.
 */
export function reconcileLegacyCameraIds(layout: Layout, sources: VideoSource[]): Layout {
  const sourceIds = new Set(sources.map((source) => source.id))
  const positions = layout.tabs.flatMap((tab) => tab.subTabs.flatMap((subTab) => subTab.cameraPositions))
  const hasLegacyFirstCamera = positions.some((position) => position.cameraId === 1 && !sourceIds.has(1))
  const hasOutOfRangeCamera = positions.some(
    (position) => position.cameraId > sources.length && !position.source
  )

  if (!hasLegacyFirstCamera || hasOutOfRangeCamera || sources.length === 0) {
    return layout
  }

  return {
    ...layout,
    tabs: layout.tabs.map((tab) => ({
      ...tab,
      subTabs: tab.subTabs.map((subTab) => ({
        ...subTab,
        cameraPositions: subTab.cameraPositions.map((position) => {
          if (position.source || position.cameraId <= 0) return position
          const source = sources[position.cameraId - 1]
          return source ? { ...position, cameraId: source.id } : position
        }),
      })),
    })),
  }
}

class VideoSourceService {
  async list(): Promise<VideoSource[]> {
    return withServiceFallback(async () => getResponseData(await apiClient.get<VideoSource[]>('/video-sources'), []), [], 'Failed to fetch video sources:')
  }
  async create(input: VideoSourceInput): Promise<VideoSource> {
    return requireSourceData(await apiClient.post<VideoSource>('/video-sources', input), 'Created video source was not returned')
  }
  async update(id: number, input: VideoSourceInput): Promise<VideoSource> {
    return requireSourceData(await apiClient.put<VideoSource>(`/video-sources/${id}`, input), 'Updated video source was not returned')
  }
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/video-sources/${id}`)
  }
}

function requireSourceData(response: ApiResponse<VideoSource>, message: string): VideoSource {
  const data = getResponseData(response, null)
  if (!data) throw new Error(message)
  return data
}

export const videoSourceService = new VideoSourceService()
