import type { CameraEventDto, PlaybackSessionDto, TimelineSegmentDto } from '@/types/cameraFocus'

interface RecordingTimelineProps {
  playbackSession: PlaybackSessionDto
  events: CameraEventDto[]
}

export function RecordingTimeline({ playbackSession, events }: RecordingTimelineProps) {
  const hasSegments = playbackSession.timelineSegments.length > 0
  const hasEvents = events.length > 0

  return (
    <div className="border-t border-slate-700 bg-slate-900 px-4 py-3 text-white" aria-label="녹화 타임라인">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
        <span>{playbackSession.availableFrom}</span>
        <span>{playbackSession.availableTo}</span>
      </div>

      <div className="relative h-12 rounded bg-slate-800" role="group" aria-label="녹화 구간과 이벤트 marker">
        {hasSegments ? (
          playbackSession.timelineSegments.map((segment) => (
            <TimelineSegment
              key={`${segment.from}-${segment.to}-${segment.status}`}
              segment={segment}
              playbackSession={playbackSession}
            />
          ))
        ) : (
          <p className="flex h-full items-center justify-center text-xs text-slate-300">표시할 녹화 구간이 없습니다.</p>
        )}

        {events.map((event) => (
          <span
            key={event.eventId}
            role="img"
            aria-label={`이벤트 marker ${event.occurredAt} ${event.title}`}
            className="absolute top-1 h-10 w-1 rounded bg-amber-300 ring-2 ring-slate-950"
            style={{ left: `${formatPercent(toPercent(event.occurredAt, playbackSession))}%` }}
          />
        ))}
      </div>

      {!hasEvents ? <p className="mt-2 text-xs text-slate-300">표시할 이벤트가 없습니다.</p> : null}
    </div>
  )
}

function TimelineSegment({
  segment,
  playbackSession,
}: {
  segment: TimelineSegmentDto
  playbackSession: PlaybackSessionDto
}) {
  const left = toPercent(segment.from, playbackSession)
  const right = toPercent(segment.to, playbackSession)
  const width = Math.max(0, right - left)
  const isGap = segment.status === 'gap'

  return (
    <span
      role="img"
      aria-label={
        isGap
          ? `녹화 공백 구간 ${segment.from}부터 ${segment.to}까지, seek 불가`
          : `녹화 가능 구간 ${segment.from}부터 ${segment.to}까지`
      }
      className={`absolute top-4 h-4 ${isGap ? 'bg-slate-500 opacity-70' : 'bg-sky-500'}`}
      style={{
        left: `${formatPercent(left)}%`,
        width: `${formatPercent(width)}%`,
      }}
    />
  )
}

function toPercent(value: string, playbackSession: PlaybackSessionDto): number {
  const start = new Date(playbackSession.availableFrom).getTime()
  const end = new Date(playbackSession.availableTo).getTime()
  const current = new Date(value).getTime()
  const duration = end - start

  if (!Number.isFinite(duration) || duration <= 0) {
    return 0
  }

  const clamped = Math.min(Math.max(current - start, 0), duration)
  return (clamped / duration) * 100
}

function formatPercent(value: number): string {
  return value.toFixed(2)
}
