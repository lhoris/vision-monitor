/**
 * Draggable Cell Component
 * 개별 그리드 셀 - 카메라 또는 빈 셀
 * FIX: Removed nested Droppable to enable drag-and-drop functionality
 */

import React, { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import type { Camera } from '@/types/camera'

interface DraggableCellProps {
  cellId: string
  index: number
  camera?: Camera
  onAddCamera: () => void
  onRemoveCamera: () => void
  isDragging?: boolean
}

export const DraggableCell: React.FC<DraggableCellProps> = ({
  cellId,
  index,
  camera,
  onAddCamera,
  onRemoveCamera,
  isDragging = false,
}) => {
  return camera ? (
    <Draggable draggableId={`camera-${camera.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`relative bg-gray-50 dark:bg-gray-700 rounded-lg border-2 transition-all duration-200
            ${
              snapshot.isDragging
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 shadow-xl opacity-90'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow-md opacity-100'
            }
            min-h-32 flex flex-col items-center justify-center cursor-move group
          `}
        >
          {/* Camera Content */}
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-2">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {camera.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{camera.location}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium
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

          {/* Remove Button - Always visible */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemoveCamera()
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all shadow-md hover:shadow-lg active:scale-95"
            title="Remove camera"
            aria-label="Remove camera"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </Draggable>
  ) : (
    <button
      onClick={onAddCamera}
      className="relative bg-white dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600
                  min-h-32 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all
                  hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 hover:shadow-md
                  w-full active:scale-98"
      title="Click to add camera"
      aria-label="Add camera to this cell"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
        <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Add Camera</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">Click anywhere</p>
    </button>
  )
}

export default DraggableCell
