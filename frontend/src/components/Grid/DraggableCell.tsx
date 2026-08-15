/**
 * Draggable Cell Component
 * HTML5 Drag & Drop API 사용
 */

import React, { useState } from 'react'
import type { Camera } from '@/types/camera'
import { LiveStreamPlayer } from '@/components/StreamPlayer/LiveStreamPlayer'

interface DraggableCellProps {
  cellId: string
  index: number
  camera?: Camera
  onAddCamera: () => void
  onRemoveCamera: () => void
  onFocusCamera?: (cameraId: number) => void
  onDragStart?: (cameraId: number) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (cellIndex: number) => void
  isDragging?: boolean
}

export const DraggableCell: React.FC<DraggableCellProps> = ({
  cellId: _cellId,
  index,
  camera,
  onAddCamera,
  onRemoveCamera,
  onFocusCamera,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging: _isDragging = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleDragStart = (e: React.DragEvent) => {
    if (camera && onDragStart) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', camera.id.toString())
      onDragStart(camera.id)
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
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDeleteClick = () => {
    onRemoveCamera()
    setContextMenu(null)
  }

  const handleFocusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (camera && onFocusCamera) {
      onFocusCamera(camera.id)
    }
  }

  return camera ? (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      className={`relative bg-gray-900 rounded-lg border-2 transition-all duration-200 aspect-video
        ${
          isDragOver
            ? 'border-blue-500 bg-blue-900 shadow-xl opacity-90'
            : 'border-gray-600 hover:border-blue-400 hover:shadow-md opacity-100'
        }
        flex flex-col items-center justify-center group overflow-hidden
      `}
    >
      {/* Drag Handle - Top Bar */}
      <div
        draggable
        onDragStart={handleDragStart}
        className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/40 to-transparent z-20 cursor-move hover:from-black/60 group flex items-center px-2"
        title="Drag to move camera"
      >
        <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-200 transition-colors" fill="currentColor" viewBox="0 0 6 10">
          <circle cx="1.5" cy="2" r="1" />
          <circle cx="4.5" cy="2" r="1" />
          <circle cx="1.5" cy="5" r="1" />
          <circle cx="4.5" cy="5" r="1" />
          <circle cx="1.5" cy="8" r="1" />
          <circle cx="4.5" cy="8" r="1" />
        </svg>
        <span className="text-xs text-gray-300 ml-1.5 truncate group-hover:text-gray-100 transition-colors">
          {camera.name}
        </span>
      </div>

      {/* Video Stream Player */}
      <LiveStreamPlayer camera={camera} className="w-full h-full" />

      <button
        type="button"
        onClick={handleFocusClick}
        className="absolute right-2 top-8 z-20 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white opacity-0 transition-opacity hover:bg-black focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-300 group-hover:opacity-100"
        aria-label={`${camera.name} 확대 보기`}
      >
        확대
      </button>

      {/* Camera Info Overlay - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-10 pointer-events-none">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-300">{camera.location}</p>
          <span
            className={`px-2 py-1 rounded text-xs font-medium
            ${
              camera.status === 'online'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                : camera.status === 'offline'
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
            }
          `}
          >
            {camera.status}
          </span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-32"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
          >
            <button
              onClick={handleDeleteClick}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:bg-opacity-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
    <button
      onClick={onAddCamera}
      className="relative bg-gray-900 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 dark:border-gray-600
                  aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all
                  hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-800 dark:hover:bg-gray-700 hover:shadow-md
                  w-full active:scale-98"
      title="Click to add camera"
      aria-label="Add camera to this cell"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-900 group-hover:bg-blue-800 transition-colors">
        <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-300">Add Camera</p>
      <p className="text-xs text-gray-400">Click to add</p>
    </button>
  )
}

export default DraggableCell
