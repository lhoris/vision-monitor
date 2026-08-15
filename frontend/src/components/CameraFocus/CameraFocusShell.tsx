import { FocusAlertBanner } from './FocusAlertBanner'
import { FocusMetadataPanel } from './FocusMetadataPanel'
import { FocusVideoStage } from './FocusVideoStage'
import type { CameraFocusMode } from '@/pages/cameraFocusRoute'
import type { Camera } from '@/types/camera'
import type {
  ActiveAlertDto,
  CameraEventDto,
  CameraFocusDto,
  EventDetailDto,
  LiveStreamDto,
  PlaybackSessionDto,
} from '@/types/cameraFocus'

interface CameraFocusShellProps {
  mode: CameraFocusMode
  selectedEventId?: number
  alerts?: ActiveAlertDto[]
  camera: CameraFocusDto | null
  cameraList?: Camera[]
  liveStream?: LiveStreamDto | null
  liveLoading?: boolean
  liveError?: string | null
  playbackSession?: PlaybackSessionDto | null
  playbackLoading?: boolean
  playbackError?: string | null
  events?: CameraEventDto[]
  eventsError?: string | null
  selectedEventDetail?: EventDetailDto | null
  cameraError?: string | null
  onModeChange?: (mode: CameraFocusMode) => void
  onSelectCamera?: (cameraId: number) => void
  onSelectEvent?: (eventId: number) => void
}

export function CameraFocusShell({
  mode,
  selectedEventId,
  alerts = [],
  camera,
  cameraList = [],
  liveStream,
  liveLoading,
  liveError,
  playbackSession,
  playbackLoading,
  playbackError,
  events,
  eventsError,
  selectedEventDetail,
  cameraError,
  onModeChange,
  onSelectCamera,
  onSelectEvent,
}: CameraFocusShellProps) {
  return (
    <section className="flex min-h-full flex-col bg-slate-900 text-gray-900 dark:text-gray-100" aria-labelledby="camera-focus-title">
      <header className="border-b border-slate-700 bg-slate-800 px-5 py-4">
        <h1 id="camera-focus-title" className="text-xl font-semibold text-white">
          카메라 집중 보기
        </h1>
        {cameraList.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="카메라 목록">
            {cameraList.map((cameraItem) => {
              const isSelected = camera?.cameraId === cameraItem.id

              return (
                <button
                  key={cameraItem.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectCamera?.(cameraItem.id)}
                  className={`min-w-28 border px-4 py-2 text-sm font-semibold ${
                    isSelected
                      ? 'border-sky-300 bg-sky-100 text-slate-900'
                      : 'border-slate-500 bg-slate-700 text-slate-200 hover:border-sky-300 hover:bg-slate-600'
                  }`}
                >
                  {cameraItem.name}
                </button>
              )
            })}
          </div>
        ) : null}
        <div className="mt-3 flex gap-2" role="tablist" aria-label="영상 모드">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'live'}
            onClick={() => onModeChange?.('live')}
            className={`border px-4 py-2 text-sm font-semibold ${
              mode === 'live' ? 'border-red-500 bg-orange-200 text-slate-900' : 'border-slate-500 bg-slate-700 text-slate-200'
            }`}
          >
            실시간
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'recording'}
            onClick={() => onModeChange?.('recording')}
            className={`border px-4 py-2 text-sm font-semibold ${
              mode === 'recording'
                ? 'border-red-500 bg-orange-200 text-slate-900'
                : 'border-slate-500 bg-slate-700 text-slate-200'
            }`}
          >
            녹화
          </button>
        </div>
      </header>
      <FocusAlertBanner alerts={alerts} />
      <div className="flex flex-1 flex-col gap-4 p-5 lg:flex-row">
        <FocusVideoStage
          mode={mode}
          selectedEventId={selectedEventId}
          camera={camera}
          liveStream={liveStream}
          liveLoading={liveLoading}
          liveError={liveError}
          playbackSession={playbackSession}
          playbackLoading={playbackLoading}
          playbackError={playbackError}
          events={events}
          eventsError={eventsError}
          selectedEventDetail={selectedEventDetail}
          onSelectEvent={onSelectEvent}
        />
        <FocusMetadataPanel camera={camera} error={cameraError} selectedEventDetail={selectedEventDetail} />
      </div>
    </section>
  )
}
