/**
 * Draggable Cell Component
 */

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Camera } from '@/types/camera'
import type { PlayerState, TemporaryVideoSource } from '@/types/streamPlayer'
import { LiveStreamPlayer } from '@/components/StreamPlayer/LiveStreamPlayer'

interface DraggableCellProps {
  cellId: string
  index: number
  camera?: Camera
  temporarySource?: TemporaryVideoSource
  positionId?: number
  onAddCamera: () => void
  onRemoveCamera: () => void
  onFocusCamera?: (cameraId: number) => void
  onRenameCamera?: (cameraId: number, name: string) => void
  onEditTemporarySource?: () => void
  onResize?: (rowSpan: number, colSpan: number) => boolean
  rowSpan?: number
  colSpan?: number
  maxRows?: number
  maxCols?: number
  onTemporaryStatusChange?: (status: PlayerState) => void
  onDragStart?: (cameraId: number) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (cellIndex: number) => void
  isDragging?: boolean
  style?: React.CSSProperties
}

export const DraggableCell: React.FC<DraggableCellProps> = ({
  cellId: _cellId,
  index,
  camera,
  temporarySource,
  positionId,
  onAddCamera,
  onRemoveCamera,
  onFocusCamera,
  onRenameCamera,
  onEditTemporarySource,
  onResize,
  rowSpan = 1,
  colSpan = 1,
  maxRows = 1,
  maxCols = 1,
  onTemporaryStatusChange,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging: _isDragging = false,
  style,
}) => {
  const { t } = useTranslation()
  const [isDragOver, setIsDragOver] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [displayName, setDisplayName] = useState(camera?.name ?? temporarySource?.displayName ?? '')
  const [renameDraft, setRenameDraft] = useState(camera?.name ?? temporarySource?.displayName ?? '')
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [resizeRows, setResizeRows] = useState(rowSpan)
  const [resizeCols, setResizeCols] = useState(colSpan)
  const [resizePreview, setResizePreview] = useState<{ rows: number; cols: number } | null>(null)
  const [resizeError, setResizeError] = useState(false)

  useEffect(() => {
    setDisplayName(camera?.name ?? temporarySource?.displayName ?? '')
    setRenameDraft(camera?.name ?? temporarySource?.displayName ?? '')
    setIsRenameDialogOpen(false)
    setContextMenu(null)
  }, [camera?.id, camera?.name, temporarySource?.id, temporarySource?.displayName])

  const isTemporary = Boolean(temporarySource)
  const effectiveCamera = camera ?? (temporarySource ? {
    id: positionId ?? -1,
    name: temporarySource.displayName,
    location: '현재 세부공정 임시 영상',
    zone: temporarySource.protocol.toUpperCase(),
    streamUrl: temporarySource.url,
    streamProtocol: temporarySource.protocol,
    status: temporarySource.playbackStatus === 'error' ? 'error' : 'online',
  } satisfies Camera : undefined)

  const handleDragStart = (e: React.DragEvent) => {
    if (effectiveCamera && onDragStart) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', effectiveCamera.id.toString())
      onDragStart(effectiveCamera.id)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
    if (onDragOver) onDragOver(e)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (onDrop) onDrop(index)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setResizeRows(rowSpan)
    setResizeCols(colSpan)
    setResizePreview(null)
    setResizeError(false)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDeleteClick = () => {
    onRemoveCamera()
    setContextMenu(null)
  }

  const handleRenameClick = () => {
    setRenameDraft(displayName)
    setIsRenameDialogOpen(true)
    setContextMenu(null)
  }

  const handleEditSourceClick = () => {
    onEditTemporarySource?.()
    setContextMenu(null)
  }

  const handleRenameSubmit = () => {
    const nextName = renameDraft.trim()
    if (!nextName) {
      return
    }

    setDisplayName(nextName)
    if (camera) {
      onRenameCamera?.(camera.id, nextName)
    }
    setIsRenameDialogOpen(false)
  }

  const handleFocusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (effectiveCamera && onFocusCamera) {
      onFocusCamera(effectiveCamera.id)
    }
  }

  return effectiveCamera ? (
    <article
      data-testid="camera-tile"
      style={style}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      className={`group flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border-2 bg-gray-900 transition-all duration-200 ${
        isDragOver
          ? 'border-blue-500 bg-blue-900 shadow-xl opacity-90'
          : 'border-gray-600 hover:border-blue-400 hover:shadow-md opacity-100'
      }`}
    >
      <div
        draggable
        onDragStart={handleDragStart}
            className="camera-tile-header flex h-9 shrink-0 cursor-move items-center justify-between gap-2 border-b px-2"
        title="Drag to move camera"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-3 w-3 shrink-0 rounded-full ${getStatusDotClass(effectiveCamera.status)}`}
            aria-label={`Status: ${effectiveCamera.status}`}
            title={effectiveCamera.status}
          />
          <div className="min-w-0">
            <h3 className="camera-tile-header__title truncate text-base font-medium leading-none">{displayName}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFocusClick}
          className="shrink-0 flex items-center justify-center p-1.5 rounded border border-sky-400 bg-sky-100 text-slate-950 opacity-0 transition-all duration-150 hover:bg-white hover:border-sky-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-300 group-hover:opacity-100 dark:bg-sky-950/40 dark:border-sky-500/50 dark:text-sky-300 dark:hover:bg-sky-900/60"
          aria-label={`${displayName} 확대 보기`}
          title="확대 보기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 bg-black" data-testid="camera-tile-video">
        <LiveStreamPlayer
          camera={{ ...effectiveCamera, name: displayName }}
          className="h-full w-full"
          autoplay
          muted
          onStateChange={isTemporary ? onTemporaryStatusChange : undefined}
          onError={isTemporary ? (() => onTemporaryStatusChange?.('error')) : undefined}
        />
      </div>

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
          >
            {isTemporary && onEditTemporarySource ? (
              <button
                onClick={handleEditSourceClick}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                {t('live.contextMenu.editAddress')}
              </button>
            ) : <button
              onClick={handleRenameClick}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {t('live.contextMenu.renameTitle')}
            </button>}
            {effectiveCamera && onResize ? (
              <div className="border-t border-gray-200 px-3 py-2 dark:border-gray-700">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{t('live.contextMenu.playerSize')}</p>
                  <span aria-live="polite" className="text-xs tabular-nums text-blue-700 dark:text-blue-300">{(resizePreview ?? { rows: resizeRows, cols: resizeCols }).rows} × {(resizePreview ?? { rows: resizeRows, cols: resizeCols }).cols}</span>
                </div>
                <div
                  role="group"
                  aria-label={t('live.contextMenu.playerSize')}
                  className="mx-auto grid w-fit gap-1"
                  style={{ gridTemplateColumns: `repeat(${maxCols}, 24px)` }}
                  onMouseLeave={() => setResizePreview(null)}
                >
                  {Array.from({ length: maxRows * maxCols }, (_, index) => {
                    const rows = Math.floor(index / maxCols) + 1
                    const cols = index % maxCols + 1
                    const displayed = resizePreview ?? { rows: resizeRows, cols: resizeCols }
                    const highlighted = rows <= displayed.rows && cols <= displayed.cols
                    const selected = rows <= resizeRows && cols <= resizeCols
                    return (
                      <button
                        key={`${rows}-${cols}`}
                        type="button"
                        aria-label={`${rows}x${cols}`}
                        aria-pressed={selected}
                        title={`${rows} × ${cols}`}
                        onMouseEnter={() => setResizePreview({ rows, cols })}
                        onFocus={() => setResizePreview({ rows, cols })}
                        onClick={() => {
                          if (onResize(rows, cols)) {
                            setContextMenu(null)
                          } else {
                            setResizeError(true)
                          }
                        }}
                        className={`h-6 w-6 rounded-sm border transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${highlighted ? 'border-blue-600 bg-blue-500 dark:border-blue-300 dark:bg-blue-400' : 'border-gray-300 bg-gray-100 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700'} ${selected ? 'ring-1 ring-blue-700 dark:ring-blue-200' : ''}`}
                      />
                    )
                  })}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('live.contextMenu.overlappingVideosRemoved')}</p>
                {resizeError ? <p role="alert" className="mt-1 text-xs text-red-600">{t('live.contextMenu.playerSizeUnavailable')}</p> : null}
              </div>
            ) : null}
            <button
              onClick={handleDeleteClick}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 hover:bg-opacity-50 dark:text-red-400 dark:hover:bg-red-900"
            >
              {t('live.contextMenu.removeVideo')}
            </button>
          </div>
        </>
      )}

      {isRenameDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-camera-dialog-title"
            className="camera-rename-dialog w-[min(420px,100%)] rounded-lg border p-5 shadow-2xl"
          >
            <h2 id="rename-camera-dialog-title" className="text-base font-semibold">
              Rename camera title
            </h2>
            <label className="mt-4 block text-sm font-medium" htmlFor="rename-camera-title">
              Title
            </label>
            <input
              id="rename-camera-title"
              type="text"
              value={renameDraft}
              onChange={(event) => setRenameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleRenameSubmit()
                }
              }}
              className="camera-rename-dialog__input mt-2 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRenameDialogOpen(false)}
                className="camera-rename-dialog__cancel rounded border px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameSubmit}
                className="rounded border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  ) : (
    <button
      data-testid="add-camera-tile"
      style={style}
      onClick={onAddCamera}
      className="relative flex h-full min-h-0 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-600 bg-gray-900 transition-all hover:border-blue-400 hover:bg-gray-800 hover:shadow-md active:scale-98 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-gray-700"
      title={t('live.clickToAddVideo')}
      aria-label={t('live.addVideo')}
    >
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-900 transition-colors group-hover:bg-blue-800">
        <svg className="h-7 w-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-300">{t('live.addVideo')}</p>
      <p className="text-xs text-gray-400">{t('live.clickToAddVideo')}</p>
    </button>
  )
}

function getStatusDotClass(status: Camera['status']): string {
  if (status === 'online') {
    return 'bg-green-500 relative before:content-[""] before:block before:absolute before:w-[20px] before:h-[20px] before:-left-[4px] before:-top-[4px] before:rounded-full before:bg-[#36a047]/40 before:animate-pulse'
  }
  if (status === 'offline') {
    return 'bg-gray-400 opacity-60'
  }
  return 'bg-red-500 relative before:content-[""] before:block before:absolute before:w-[20px] before:h-[20px] before:-left-[4px] before:-top-[4px] before:rounded-full before:bg-red-500/40 before:animate-pulse'
}

export default DraggableCell
