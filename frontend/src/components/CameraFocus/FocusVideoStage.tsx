import { useEffect, useRef, useState } from 'react'
import type { CameraFocusMode } from '@/pages/cameraFocusRoute'
import { LiveStreamPlayer } from '@/components/StreamPlayer/LiveStreamPlayer'
import { RecordingTimeline } from './RecordingTimeline'
import { StreamPlayerComponent } from '@/components/StreamPlayer/StreamPlayerComponent'
import type { Camera } from '@/types/camera'
import type { CameraEventDto, CameraFocusDto, EventDetailDto, LiveStreamDto, PlaybackSessionDto } from '@/types/cameraFocus'
import type { StreamProtocol } from '@/types/streamPlayer'
import type { TimelineRangeSeconds } from './recordingTimelineModel'
import { formatTimelineDateTime } from './recordingTimelineModel'

interface FocusVideoStageProps {
  mode: CameraFocusMode
  camera?: CameraFocusDto | null
  liveStream?: LiveStreamDto | null
  liveLoading?: boolean
  liveError?: string | null
  playbackSession?: PlaybackSessionDto | null
  playbackLoading?: boolean
  playbackError?: string | null
  events?: CameraEventDto[]
  eventsError?: string | null
  selectedEventDetail?: EventDetailDto | null
  selectedEventId?: number
  onSelectEvent?: (eventId: number) => void
  timelineDate?: string
  onDateChange?: (date: string) => void
  onRecordingSubmit?: () => void
  recordingWorkArea?: TimelineRangeSeconds
  onRecordingWorkAreaChange?: (range: TimelineRangeSeconds) => void
  onRecordingWorkAreaCommit?: (range: TimelineRangeSeconds) => void
  onTimelineSeek?: (timestamp: string) => void
}

export function FocusVideoStage({
  mode,
  camera,
  liveStream,
  liveLoading = false,
  liveError,
  playbackSession,
  playbackLoading = false,
  playbackError,
  events = [],
  eventsError,
  selectedEventDetail,
  selectedEventId,
  onSelectEvent,
  timelineDate,
  onDateChange,
  onRecordingSubmit,
  recordingWorkArea,
  onRecordingWorkAreaChange,
  onRecordingWorkAreaCommit,
  onTimelineSeek,
}: FocusVideoStageProps) {
  const title = mode === 'recording' ? '녹화 영상 영역' : '실시간 영상 영역'
  const [recordingTimeSeconds, setRecordingTimeSeconds] = useState(0)
  const [recordingSeekSeconds, setRecordingSeekSeconds] = useState<number | null>(null)

  const [recordingMediaError, setRecordingMediaError] = useState(false)

  useEffect(() => {
    setRecordingMediaError(false)
  }, [playbackSession?.playbackUrl])

  if (mode === 'live' && liveLoading) {
    return <VideoStateMessage tone="neutral" message="영상을 불러오는 중입니다." />
  }

  if (mode === 'live' && liveError) {
    return (
      <VideoStateMessage
        tone="error"
        message={liveError === 'FORBIDDEN' ? '이 카메라에 접근 권한이 없습니다.' : '실시간 영상을 불러오지 못했습니다.'}
      />
    )
  }

  if (mode === 'live' && camera && liveStream) {
    return (
      <section className="focus-video-stage flex min-h-[420px] flex-1 flex-col">
        <LiveStreamPlayer
          camera={toPlayerCamera(camera, liveStream)}
          className="h-full min-h-[420px] w-full"
          autoplay
          muted
        />
      </section>
    )
  }

  if (mode === 'recording' && playbackLoading) {
    return <VideoStateMessage tone="neutral" message="녹화 영상을 불러오는 중입니다." />
  }

  if (mode === 'recording' && (playbackError || playbackSession)) {
    const seekTarget = getSeekTarget({
      playbackSession: playbackSession ?? null,
      events,
      selectedEventDetail,
      selectedEventId,
    })

    return (
    <section className="focus-video-stage flex min-h-0 flex-1 flex-col">
        {playbackSession ? (
          <>
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {playbackSession.playbackProtocol === 'mp4' ? (
              <RecordingVideo
                  key={`${playbackSession.sessionId}:${playbackSession.availableFrom}:${playbackSession.availableTo}:${seekTarget ?? 'start'}`}
                  url={playbackSession.playbackUrl}
                  seekTarget={seekTarget}
                  availableFrom={playbackSession.availableFrom}
                  seekSeconds={recordingSeekSeconds}
                  onTimeUpdate={setRecordingTimeSeconds}
                  onError={() => setRecordingMediaError(true)}
                />
              ) : (
                <StreamPlayerComponent
                  key={`${playbackSession.sessionId}:${playbackSession.availableFrom}:${playbackSession.availableTo}:${seekTarget ?? 'start'}`}
                  source={{
                    url: playbackSession.playbackUrl,
                    protocol: toPlaybackProtocol(playbackSession.playbackProtocol),
                    label: seekTarget ? `seek:${seekTarget}` : undefined,
                  }}
                  autoplay
                  controls
                  className="h-full min-h-0 w-full"
                />
              )}
              {recordingMediaError ? <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center text-sm text-amber-200">선택한 구간에 녹화 영상이 없습니다.</div> : null}
            </div>
            {timelineDate && recordingWorkArea ? (
              <RecordingTimeline
                playbackSession={playbackSession}
                events={eventsError ? [] : events}
                dayStart={timelineDate}
                workArea={recordingWorkArea}
                loading={playbackLoading}
                playheadTimestamp={getPlayheadTimestamp(playbackSession, recordingTimeSeconds)}
                onDateChange={onDateChange}
                onPlay={onRecordingSubmit}
                onWorkAreaChange={onRecordingWorkAreaChange}
                onWorkAreaCommit={onRecordingWorkAreaCommit}
                onSeek={(timestamp) => {
                  const targetSeconds = (new Date(timestamp).getTime() - new Date(playbackSession.availableFrom).getTime()) / 1000
                  if (targetSeconds >= 0 && targetSeconds <= getPlaybackDurationSeconds(playbackSession)) {
                    setRecordingSeekSeconds(Math.max(0, targetSeconds))
                  }
                  onTimelineSeek?.(timestamp)
                }}
                onSelectEvent={onSelectEvent}
              />
            ) : null}
          </>
        ) : (
          <div className="flex h-[60vh] min-h-[480px] max-h-[720px] items-center justify-center">
            <p className="focus-video-stage__error text-sm">
              {playbackError === 'FORBIDDEN' ? '녹화 영상 접근 권한이 없습니다.' : isNoRecordingError(playbackError) ? '선택한 구간에 녹화 영상이 없습니다.' : '녹화 영상을 불러오지 못했습니다.'}
            </p>
          </div>
        )}
        {false && eventsError ? (
          <p className="focus-recording-message focus-recording-message--error border-t px-4 py-3 text-xs">
            알람 목록을 불러오지 못했습니다.
          </p>
        ) : null}
        {selectedEventId ? <p className="sr-only">선택 알람: {selectedEventId}</p> : null}
      </section>
    )
  }

  return (
    <section className="focus-video-stage flex min-h-[420px] flex-1 flex-col justify-between">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-gray-300">영상 플레이어는 후속 Story에서 연결합니다.</p>
          {selectedEventId ? <p className="mt-2 text-sm">선택 알람: {selectedEventId}</p> : null}
        </div>
      </div>
    </section>
  )
}

function RecordingVideo({
  url,
  seekTarget,
  availableFrom,
  seekSeconds,
  onTimeUpdate,
  onError,
}: {
  url: string
  seekTarget: string | null
  availableFrom: string
  seekSeconds: number | null
  onTimeUpdate: (seconds: number) => void
  onError: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (seekSeconds === null || !videoRef.current) return
    videoRef.current.currentTime = seekSeconds
  }, [seekSeconds])

  useEffect(() => {
    if (!seekTarget || !videoRef.current) return
    const offset = Math.max(0, (new Date(seekTarget).getTime() - new Date(availableFrom).getTime()) / 1000)
    const video = videoRef.current
    const seek = () => {
      if (Number.isFinite(offset)) video.currentTime = offset
    }
    if (video.readyState >= 1) seek()
    else video.addEventListener('loadedmetadata', seek, { once: true })
    return () => video.removeEventListener('loadedmetadata', seek)
  }, [availableFrom, seekTarget])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = () => {
      if (typeof video.play !== 'function') return
      void video.play().catch(() => undefined)
    }

    if (video.readyState >= 2) {
      playVideo()
      return
    }

    video.addEventListener('canplay', playVideo, { once: true })
    return () => video.removeEventListener('canplay', playVideo)
  }, [url])

  return (
    <video
      data-testid="focus-recording-video"
      ref={videoRef}
      src={url}
      controls
      autoPlay
      playsInline
      onError={onError}
      onTimeUpdate={(event) => onTimeUpdate(event.currentTarget.currentTime)}
      onLoadedMetadata={(event) => onTimeUpdate(event.currentTarget.currentTime)}
      className="h-full min-h-0 max-h-full w-full bg-black object-contain"
    />
  )
}

function isNoRecordingError(error: string | null | undefined) {
  return error === 'NO_RECORDING' || error === 'NOT_FOUND' || error === '404'
}

function getPlaybackDurationSeconds(playbackSession: PlaybackSessionDto): number {
  return Math.max(0, (new Date(playbackSession.availableTo).getTime() - new Date(playbackSession.availableFrom).getTime()) / 1000)
}

function getPlayheadTimestamp(playbackSession: PlaybackSessionDto, currentTimeSeconds: number): string {
  const timestamp = new Date(new Date(playbackSession.availableFrom).getTime() + Math.max(0, currentTimeSeconds) * 1000)
  return formatTimelineDateTime(timestamp)
}

function getSeekTarget({
  playbackSession,
  events,
  selectedEventDetail,
  selectedEventId,
}: {
  playbackSession: PlaybackSessionDto | null
  events: CameraEventDto[]
  selectedEventDetail?: EventDetailDto | null
  selectedEventId?: number
}): string | null {
  if (!selectedEventId || !playbackSession) {
    return null
  }

  if (selectedEventDetail?.playbackHint?.seekAt) {
    return selectedEventDetail.playbackHint.seekAt
  }

  const event = events.find((candidate) => candidate.eventId === selectedEventId)
  if (!event) {
    return null
  }

  const seekAt = new Date(event.occurredAt).getTime() - playbackSession.preRollSeconds * 1000
  return new Date(seekAt).toISOString()
}

function VideoStateMessage({ tone, message }: { tone: 'neutral' | 'error'; message: string }) {
  return (
    <section className="focus-video-stage flex min-h-[420px] flex-1 flex-col justify-between">
      <div className="flex flex-1 items-center justify-center">
        <p className={`text-sm ${tone === 'error' ? 'focus-video-stage__error' : 'focus-video-stage__muted'}`}>{message}</p>
      </div>
    </section>
  )
}

function toPlayerCamera(camera: CameraFocusDto, liveStream: LiveStreamDto): Camera {
  return {
    id: camera.cameraId,
    name: camera.cameraName,
    location: camera.location,
    zone: camera.zoneName,
    streamUrl: liveStream.streamUrl,
    streamProtocol: toCameraStreamProtocol(liveStream.streamProtocol),
    status: toCameraStatus(camera.status),
    resolution: liveStream.resolution ?? undefined,
    fps: liveStream.fps ?? undefined,
  }
}

function toCameraStreamProtocol(protocol: LiveStreamDto['streamProtocol']): Camera['streamProtocol'] {
  if (protocol === 'hls' || protocol === 'webrtc') {
    return protocol
  }
  if (protocol === 'rtsp_bridge') {
    return 'rtsp'
  }
  return undefined
}

function toCameraStatus(status: CameraFocusDto['status']): Camera['status'] {
  if (status === 'online' || status === 'offline' || status === 'error') {
    return status
  }
  return 'error'
}

function toPlaybackProtocol(protocol: PlaybackSessionDto['playbackProtocol']): StreamProtocol {
  if (protocol === 'hls' || protocol === 'webrtc') {
    return protocol
  }
  return 'unknown'
}
