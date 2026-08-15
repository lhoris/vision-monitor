import type { CameraEventDto } from '@/types/cameraFocus'

interface RecordingEventListProps {
  events: CameraEventDto[]
  selectedEventId: number | null
  onSelectEvent: (eventId: number) => void
}

export function RecordingEventList({ events, selectedEventId, onSelectEvent }: RecordingEventListProps) {
  if (events.length === 0) {
    return <p className="focus-recording-message border-t px-4 py-3 text-xs">표시할 이벤트가 없습니다.</p>
  }

  return (
    <div className="focus-recording-panel border-t px-4 py-3" aria-label="녹화 이벤트 목록">
      <div className="grid gap-2 md:grid-cols-2">
        {events.map((event) => (
          <button
            key={event.eventId}
            type="button"
            aria-pressed={selectedEventId === event.eventId}
            aria-label={`${event.title} ${event.occurredAt} ${event.severity}`}
            onClick={() => onSelectEvent(event.eventId)}
            onKeyDown={(keyboardEvent) => {
              if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                keyboardEvent.preventDefault()
                onSelectEvent(event.eventId)
              }
            }}
            className={`focus-recording-event border px-3 py-2 text-left text-xs ${
              selectedEventId === event.eventId
                ? 'focus-recording-event--selected'
                : 'focus-recording-event--idle'
            }`}
          >
            <span className="block font-semibold">{event.title}</span>
            <span className="mt-1 block text-[11px] opacity-80">{event.occurredAt}</span>
            <span className="mt-1 block text-[11px] uppercase">{event.severity}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
