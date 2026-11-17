import { useEffect, useRef, useState } from 'react'
import type { CameraFocusMode } from '@/pages/cameraFocusRoute'
import { LiveStreamPlayer } from '@/components/StreamPlayer/LiveStreamPlayer'
import { RecordingEventList } from './RecordingEventList'
import { RecordingTimeline } from './RecordingTimeline'
import { StreamPlayerComponent } from '@/components/StreamPlayer/StreamPlayerComponent'
import type { Camera } from '@/types/camera'
import type { CameraEventDto, CameraFocusDto, EventDetailDto, LiveStreamDto, PlaybackSessionDto } from '@/types/cameraFocus'
import type { StreamProtocol } from '@/types/streamPlayer'
import type { TimelineRangeSeconds } from './recordingTimelineModel'

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
  recordingWorkArea?: TimelineRangeSeconds
  onRecordingWorkAreaChange?: (range: TimelineRangeSeconds) => void
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
  recordingWorkArea,
  onRecordingWorkAreaChange,
  onTimelineSeek,
}: FocusVideoStageProps) {
  const title = mode === 'recording' ? '녹화 영상 영역' : '실시간 영상 영역'
  const [recordingTimeSeconds, setRecordingTimeSeconds] = useState(0)
  const [recordingSeekSeconds, setRecordingSeekSeconds] = useState<number | null>(null)

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
      <section className="focus-video-stage min-h-[420px] flex-1">
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
      <section className="focus-video-stage min-h-[420px] flex-1">
        {playbackSession ? (
          <>
            {playbackSession.playbackProtocol === 'mp4' ? (
            <RecordingVideo
                key={`${playbackSession.sessionId}:${seekTarget ?? 'start'}`}
                url={playbackSession.playbackUrl}
                seekTarget={seekTarget}
                availableFrom={playbackSession.availableFrom}
                seekSeconds={recordingSeekSeconds}
                onTimeUpdate={setRecordingTimeSeconds}
              />
            ) : (
              <StreamPlayerComponent
                key={`${playbackSession.sessionId}:${seekTarget ?? 'start'}`}
                source={{
                  url: playbackSession.playbackUrl,
                  protocol: toPlaybackProtocol(playbackSession.playbackProtocol),
                  label: seekTarget ? `seek:${seekTarget}` : undefined,
                }}
                autoplay={false}
                controls
                className="h-[360px] w-full"
              />
            )}
            {timelineDate && recordingWorkArea ? (
              <RecordingTimeline
                playbackSession={playbackSession}
                events={eventsError ? [] : events}
                dayStart={timelineDate}
                workArea={recordingWorkArea}
                playheadTimestamp={getPlayheadTimestamp(playbackSession, recordingTimeSeconds)}
                onWorkAreaChange={onRecordingWorkAreaChange}
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
          <div className="flex h-[360px] items-center justify-center">
            <p className="focus-video-stage__error text-sm">
              {playbackError === 'FORBIDDEN' ? '녹화 영상 접근 권한이 없습니다.' : '녹화 영상을 불러오지 못했습니다.'}
            </p>
          </div>
        )}
        {eventsError ? (
          <p className="focus-recording-message focus-recording-message--error border-t px-4 py-3 text-xs">
            알람 목록을 불러오지 못했습니다.
          </p>
        ) : (
          <RecordingEventList
            events={events}
            selectedEventId={selectedEventId ?? null}
            onSelectEvent={onSelectEvent ?? (() => undefined)}
          />
        )}
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
}: {
  url: string
  seekTarget: string | null
  availableFrom: string
  seekSeconds: number | null
  onTimeUpdate: (seconds: number) => void
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

  return (
    <video
      data-testid="focus-recording-video"
      ref={videoRef}
      src={url}
      controls
      autoPlay
      playsInline
      onTimeUpdate={(event) => onTimeUpdate(event.currentTarget.currentTime)}
      onLoadedMetadata={(event) => onTimeUpdate(event.currentTarget.currentTime)}
      className="h-[360px] w-full bg-black object-contain"
    />
  )
}

function getPlaybackDurationSeconds(playbackSession: PlaybackSessionDto): number {
  return Math.max(0, (new Date(playbackSession.availableTo).getTime() - new Date(playbackSession.availableFrom).getTime()) / 1000)
}

function getPlayheadTimestamp(playbackSession: PlaybackSessionDto, currentTimeSeconds: number): string {
  const timestamp = new Date(new Date(playbackSession.availableFrom).getTime() + Math.max(0, currentTimeSeconds) * 1000)
  return timestamp.toISOString()
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
