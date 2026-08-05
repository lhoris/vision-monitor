/**
 * Camera Selector Modal Component
 * 사용 가능한 CCTV 카메라 목록 표시 및 선택
 */

import React, { useEffect, useState } from 'react'
import type { Camera } from '@/types/camera'

interface CameraSelectorProps {
  isOpen: boolean
  cameras: Camera[]
  usedCameraIds: number[]
  onSelect: (camera: Camera) => void
  onClose: () => void
  loading?: boolean
}

export const CameraSelector: React.FC<CameraSelectorProps> = ({
  isOpen,
  cameras,
  usedCameraIds,
  onSelect,
  onClose,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCameras, setFilteredCameras] = useState<Camera[]>([])

  // 사용 가능한 카메라 필터링 (이미 사용 중인 카메라 제외)
  useEffect(() => {
    const available = cameras.filter((cam) => !usedCameraIds.includes(cam.id))

    const filtered = available.filter(
      (cam) =>
        cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cam.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cam.zone.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredCameras(filtered)
  }, [cameras, usedCameraIds, searchTerm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">📹 Select Camera</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose a camera to add to this cell</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                       transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search cameras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Camera List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading cameras...</div>
          ) : filteredCameras.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {cameras.length === 0 ? 'No cameras available' : 'No matching cameras'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCameras.map((camera) => (
                <li key={camera.id}>
                  <button
                    onClick={() => {
                      onSelect(camera)
                      setSearchTerm('')
                      onClose()
                    }}
                    className="w-full text-left px-4 py-4 hover:bg-blue-50 dark:hover:bg-gray-700
                               transition-colors focus:outline-none focus:bg-blue-50 dark:focus:bg-gray-700
                               active:bg-blue-100 dark:active:bg-gray-600 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          📷 {camera.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {camera.location}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Zone: {camera.zone}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                            ${
                              camera.status === 'online'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                                : camera.status === 'offline'
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                            }
                          `}
                        >
                          ● {camera.status}
                        </span>
                      </div>
                    </div>
                    {camera.resolution && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {camera.resolution} • {camera.fps}fps
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                       rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CameraSelector
