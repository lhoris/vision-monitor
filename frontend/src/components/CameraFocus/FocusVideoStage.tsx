import type { CameraFocusMode } from '@/pages/cameraFocusRoute'
import { LiveStreamPlayer } from '@/components/StreamPlayer/LiveStreamPlayer'
import { RecordingEventList } from './RecordingEventList'
import { RecordingTimeline } from './RecordingTimeline'
import { StreamPlayerComponent } from '@/components/StreamPlayer/StreamPlayerComponent'
import type { Camera } from '@/types/camera'
import type { CameraEventDto, CameraFocusDto, EventDetailDto, LiveStreamDto, PlaybackSessionDto } from '@/types/cameraFocus'
import type { StreamProtocol } from '@/types/streamPlayer'

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
}: FocusVideoStageProps) {
  const title = mode === 'recording' ? '녹화 영상 영역' : '실시간 영상 영역'

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
      <section className="min-h-[420px] flex-1 bg-gray-950 text-white">
        <LiveStreamPlayer camera={toPlayerCamera(camera, liveStream)} className="h-full min-h-[420px] w-full" />
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
      <section className="min-h-[420px] flex-1 bg-gray-950 text-white">
        {playbackSession ? (
          <>
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
            <RecordingTimeline playbackSession={playbackSession} events={eventsError ? [] : events} />
          </>
        ) : (
          <div className="flex h-[360px] items-center justify-center">
            <p className="text-sm text-red-200">
              {playbackError === 'FORBIDDEN' ? '녹화 영상 접근 권한이 없습니다.' : '녹화 영상을 불러오지 못했습니다.'}
            </p>
          </div>
        )}
        {eventsError ? (
          <p className="border-t border-slate-700 bg-slate-900 px-4 py-3 text-xs text-red-200">
            이벤트 목록을 불러오지 못했습니다.
          </p>
        ) : (
          <RecordingEventList
            events={events}
            selectedEventId={selectedEventId ?? null}
            onSelectEvent={onSelectEvent ?? (() => undefined)}
          />
        )}
        {selectedEventId ? <p className="sr-only">선택 이벤트: {selectedEventId}</p> : null}
      </section>
    )
  }

  return (
    <section className="flex min-h-[420px] flex-1 flex-col justify-between bg-gray-950 text-white">
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-gray-300">영상 플레이어는 후속 Story에서 연결됩니다.</p>
          {selectedEventId ? <p className="mt-2 text-sm">선택 이벤트: {selectedEventId}</p> : null}
        </div>
      </div>
    </section>
  )
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
    <section className="flex min-h-[420px] flex-1 flex-col justify-between bg-gray-950 text-white">
      <div className="flex flex-1 items-center justify-center">
        <p className={`text-sm ${tone === 'error' ? 'text-red-200' : 'text-gray-300'}`}>{message}</p>
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
