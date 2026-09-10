import { apiClient } from './api'
import { getResponseData, withServiceFallback } from './serviceUtils'
import type { VideoSource, VideoSourceInput } from '@/types/videoSource'

class VideoSourceService {
  async list(): Promise<VideoSource[]> {
    return withServiceFallback(async () => getResponseData(await apiClient.get<VideoSource[]>('/video-sources'), []), [], 'Failed to fetch video sources:')
  }
  async create(input: VideoSourceInput): Promise<VideoSource | null> {
    return getResponseData(await apiClient.post<VideoSource>('/video-sources', input), null)
  }
  async update(id: number, input: VideoSourceInput): Promise<VideoSource | null> {
    return getResponseData(await apiClient.put<VideoSource>(`/video-sources/${id}`, input), null)
  }
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/video-sources/${id}`)
  }
}

export const videoSourceService = new VideoSourceService()
