import { useState } from 'react'
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
  onTriggerTestAlert?: (message: string) => void
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
  onTriggerTestAlert,
}: CameraFocusShellProps) {
  const [isTestAlertDialogOpen, setIsTestAlertDialogOpen] = useState(false)
  const [testAlertMessage, setTestAlertMessage] = useState('[테스트 경고] Entry Zone 치입불 발생 중')

  function handleSubmitTestAlert() {
    const message = testAlertMessage.trim()
    if (!message) {
      return
    }

    onTriggerTestAlert?.(message)
    setIsTestAlertDialogOpen(false)
  }

  return (
    <section className="focus-shell flex min-h-full flex-col" aria-labelledby="camera-focus-title">
      <header className="focus-shell__header border-b px-5 py-4">
        <h1 id="camera-focus-title" className="focus-shell__title text-xl font-semibold">
          화면 확대 보기
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
                  className={`focus-camera-tab min-w-28 border px-4 py-2 text-sm font-semibold ${
                    isSelected
                      ? 'focus-camera-tab--selected'
                      : 'focus-camera-tab--idle'
                  }`}
                >
                  {cameraItem.name}
                </button>
              )
            })}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="tablist" aria-label="영상 모드">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'live'}
              onClick={() => onModeChange?.('live')}
              className={`focus-mode-tab border px-4 py-2 text-sm font-semibold ${
                mode === 'live' ? 'focus-mode-tab--selected' : 'focus-mode-tab--idle'
              }`}
            >
              실시간
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'recording'}
              onClick={() => onModeChange?.('recording')}
              className={`focus-mode-tab border px-4 py-2 text-sm font-semibold ${
                mode === 'recording'
                  ? 'focus-mode-tab--selected'
                  : 'focus-mode-tab--idle'
              }`}
            >
              녹화
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsTestAlertDialogOpen(true)}
            className="focus-action-button border px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2"
          >
            테스트 알람
          </button>
        </div>
      </header>
      <FocusAlertBanner alerts={alerts} />
      <div className="focus-shell__body flex flex-1 flex-col gap-4 p-5 lg:flex-row">
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
      {isTestAlertDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-alert-dialog-title"
            className="w-[min(520px,100%)] border border-slate-500 bg-slate-800 p-5 text-white shadow-2xl"
          >
            <h2 id="test-alert-dialog-title" className="text-base font-semibold">
              테스트 알람 메시지
            </h2>
            <label className="mt-4 block text-sm font-medium" htmlFor="test-alert-message">
              경고 메시지
            </label>
            <textarea
              id="test-alert-message"
              value={testAlertMessage}
              onChange={(event) => setTestAlertMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  handleSubmitTestAlert()
                }
              }}
              rows={4}
              className="mt-2 w-full resize-none border border-slate-500 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTestAlertDialogOpen(false)}
                className="border border-slate-500 bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmitTestAlert}
                className="border border-amber-500 bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                띄우기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
