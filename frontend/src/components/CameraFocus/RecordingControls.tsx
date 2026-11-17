import type { CameraPlaybackRange } from '@/types/cameraFocus'

interface RecordingControlsProps {
  date: string
  range: CameraPlaybackRange
  loading: boolean
  error?: string | null
  onChange: (range: CameraPlaybackRange) => void
  onDateChange: (date: string) => void
  onSubmit: () => void
}

export function RecordingControls({ date, range, loading, error, onChange, onDateChange, onSubmit }: RecordingControlsProps) {
  return (
    <div className="focus-recording-controls border-b px-4 py-3" data-onboarding="camera-focus-recording-controls">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-40 flex-col gap-1 text-xs font-semibold">
          <span>탐색 날짜</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="border border-slate-500 bg-slate-900 px-2 py-2 text-sm font-normal text-white"
          />
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-semibold">
          <span>시작 시각</span>
          <input
            type="datetime-local"
            step="1"
            value={range.from}
            onChange={(event) => onChange({ ...range, from: event.target.value, eventId: undefined })}
            className="border border-slate-500 bg-slate-900 px-2 py-2 text-sm font-normal text-white"
          />
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-semibold">
          <span>종료 시각</span>
          <input
            type="datetime-local"
            step="1"
            value={range.to}
            onChange={(event) => onChange({ ...range, to: event.target.value, eventId: undefined })}
            className="border border-slate-500 bg-slate-900 px-2 py-2 text-sm font-normal text-white"
          />
        </label>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="border border-sky-400 bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? '조회 중...' : '범위 조회/재생'}
        </button>
      </div>
      {error === 'INVALID_RANGE' ? <p className="mt-2 text-xs text-amber-300">시작 시각은 종료 시각보다 빨라야 합니다.</p> : null}
    </div>
  )
}
