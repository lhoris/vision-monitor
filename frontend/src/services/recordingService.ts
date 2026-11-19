import type { ApiResponse } from '@/types/api'
import type { CameraPlaybackRange, PlaybackSessionDto } from '@/types/cameraFocus'

const MVP_RECORDING_BASE_URL = 'http://172.18.86.42'
const MVP_RECORDING_PATH = '/playback/video6.mp4'
const MVP_RECORDING_USER = 'admin'
const MVP_RECORDING_PASSWORD = 'Pcctv114!'

export const MVP_RECORDING_RANGE = {
  from: '2026-11-17T07:29:31',
  to: '2026-11-17T07:30:01',
} as const

class RecordingService {
  async getCameraPlayback(
    cameraId: number,
    range: CameraPlaybackRange,
    recordingBaseUrl?: string | null
  ): Promise<ApiResponse<PlaybackSessionDto>> {
    if (!Number.isSafeInteger(cameraId) || cameraId <= 0) {
      return {
        success: false,
        error: 'INVALID_CAMERA_ID',
        message: 'Camera id must be a positive integer.',
        timestamp: new Date().toISOString(),
      }
    }

    if (!isValidRange(range)) {
      return {
        success: false,
        error: 'INVALID_RANGE',
        message: '녹화 시작 시각은 종료 시각보다 빨라야 합니다.',
        timestamp: new Date().toISOString(),
      }
    }

    const playbackUrl = new URL(recordingBaseUrl?.trim() || `${MVP_RECORDING_BASE_URL}${MVP_RECORDING_PATH}`)
    playbackUrl.searchParams.set('start', toRecordingTimestamp(range.from))
    playbackUrl.searchParams.set('end', toRecordingTimestamp(range.to))
    playbackUrl.searchParams.set('user', MVP_RECORDING_USER)
    playbackUrl.searchParams.set('password', MVP_RECORDING_PASSWORD)

    const data: PlaybackSessionDto = {
      cameraId,
      playbackUrl: playbackUrl.toString(),
      playbackProtocol: 'mp4',
      sessionId: `mvp-video6-${toRecordingTimestamp(range.from)}-${toRecordingTimestamp(range.to)}`,
      expiresAt: null,
      availableFrom: range.from,
      availableTo: range.to,
      seekable: true,
      preRollSeconds: 30,
      timelineSegments: [{ from: range.from, to: range.to, status: 'available', seekable: true }],
    }

    return { success: true, data, timestamp: new Date().toISOString() }
  }
}

export const recordingService = new RecordingService()

function isValidRange(range: CameraPlaybackRange): boolean {
  const from = new Date(range.from).getTime()
  const to = new Date(range.to).getTime()
  return Number.isFinite(from) && Number.isFinite(to) && to > from
}

function toRecordingTimestamp(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value.slice(0, 19)
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
