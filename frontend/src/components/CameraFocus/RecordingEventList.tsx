import type { CameraEventDto } from '@/types/cameraFocus'

interface RecordingEventListProps {
  events: CameraEventDto[]
  selectedEventId: number | null
  onSelectEvent: (eventId: number) => void
}

export function RecordingEventList({ events, selectedEventId, onSelectEvent }: RecordingEventListProps) {
  if (events.length === 0) {
    return <p className="border-t border-slate-700 bg-slate-900 px-4 py-3 text-xs text-slate-300">표시할 이벤트가 없습니다.</p>
  }

  return (
    <div className="border-t border-slate-700 bg-slate-900 px-4 py-3 text-white" aria-label="녹화 이벤트 목록">
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
            className={`border px-3 py-2 text-left text-xs ${
              selectedEventId === event.eventId
                ? 'border-amber-300 bg-amber-100 text-slate-950'
                : 'border-slate-600 bg-slate-800 text-slate-100'
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
