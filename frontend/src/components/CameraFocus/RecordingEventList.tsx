import type { CameraEventDto } from '@/types/cameraFocus'

interface RecordingEventListProps {
  events: CameraEventDto[]
  selectedEventId: number | null
  onSelectEvent: (eventId: number) => void
  emptyMessage?: string
  ariaLabel?: string
}

export function RecordingEventList({ events, selectedEventId, onSelectEvent, emptyMessage = '표시할 알람이 없습니다.', ariaLabel = '알람 이력' }: RecordingEventListProps) {
  if (events.length === 0) {
    return <p className="focus-recording-message border-t px-4 py-3 text-xs">{emptyMessage}</p>
  }

  return (
    <div className="focus-recording-panel overflow-auto border-t px-4 py-3" aria-label={ariaLabel}>
      <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-xs">
        <thead><tr><th className="border-b border-r px-2 py-2 font-semibold">발생 시각</th><th className="border-b border-r px-2 py-2 font-semibold">알람 유형</th><th className="border-b border-r px-2 py-2 font-semibold">등급</th><th className="border-b border-r px-2 py-2 font-semibold">알람 내용</th><th className="border-b px-2 py-2 font-semibold">확인 상태</th></tr></thead>
        <tbody>
          {events.map((event) => {
            const selected = selectedEventId === event.eventId
            return <tr key={event.eventId} role="button" tabIndex={0} aria-pressed={selected} aria-label={`${event.title} ${event.occurredAt} ${event.severity}`} onClick={() => onSelectEvent(event.eventId)} onKeyDown={(keyboardEvent) => { if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') { keyboardEvent.preventDefault(); onSelectEvent(event.eventId) } }} className={`cursor-pointer outline-none transition-colors ${selected ? 'bg-blue-100 shadow-[inset_4px_0_0_#2563eb] dark:bg-blue-950/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'} focus-visible:bg-blue-50 dark:focus-visible:bg-blue-950/40`}>
              <td className="whitespace-nowrap border-b border-r px-2 py-2">{formatEventTime(event.occurredAt)}</td><td className="max-w-[180px] truncate border-b border-r px-2 py-2 font-semibold" title={event.eventType}>{event.eventType}</td><td className="border-b border-r px-2 py-2 uppercase">{event.severity}</td><td className="max-w-[260px] truncate border-b border-r px-2 py-2" title={event.title}>{event.title}</td><td className="whitespace-nowrap border-b px-2 py-2">{event.status === 'acknowledged' ? '확인' : '미확인'}</td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  )
}

function formatEventTime(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ko-KR', { hour12: false })
}
