import { useState } from 'react'
import { Card, CardBody, CardHeader, Button } from '@/components/Common'
import type { CameraDetail } from '@/types/camera'

interface CameraDetailViewProps {
  camera: CameraDetail
  onClose: () => void
}

export function CameraDetailView({ camera, onClose }: CameraDetailViewProps) {
  const [isRecording, setIsRecording] = useState(camera.recordingEnabled)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-full md:max-w-6xl md:max-h-[90vh] md:rounded-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {camera.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {camera.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Feed */}
            <Card>
              <div className="w-full bg-black aspect-video flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-600"
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

              {/* Controls */}
              <CardBody className="space-y-4">
                {/* Timeline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')}</span>
                    <span>1:00:00</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3600"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-2"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.75 1.5A.75.75 0 015 2.25v15.5a.75.75 0 001.5 0V2.25A.75.75 0 015.75 1.5zm8.5 0a.75.75 0 01.75.75v15.5a.75.75 0 01-1.5 0V2.25a.75.75 0 01.75-.75z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Events Timeline */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Recent Events
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Motion Detected
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        High Motion Activity
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        5 minutes ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Panel - Information */}
          <div className="space-y-4">
            {/* Camera Status */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Status
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`
                        w-2 h-2 rounded-full
                        ${
                          camera.status === 'online'
                            ? 'bg-green-500'
                            : camera.status === 'offline'
                              ? 'bg-gray-500'
                              : 'bg-red-500'
                        }
                      `}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {camera.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Resolution
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {camera.resolution || 'Unknown'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    FPS
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {camera.fps || 30} fps
                  </p>
                </div>

                {camera.lastSeen && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Last Seen
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {new Date(camera.lastSeen).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Recording Status */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Recording
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecording}
                    onChange={(e) => setIsRecording(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {isRecording ? 'Recording' : 'Not Recording'}
                  </span>
                </label>

                {camera.stream && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Stream Type
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
                      {camera.stream.type.toUpperCase()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Alerts
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {camera.alerts || 0} active
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full">View Full Details</Button>
              <Button variant="secondary" className="w-full">
                Configure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
