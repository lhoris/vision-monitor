/**
 * Playback Page
 * 녹화 영상 재생 및 시간 선택 UI
 */

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Input, Select } from '@/components/Common'
import { useAppSelector } from '@/store'

export function Playback() {
  const cameras = useAppSelector((state) => state.camera.cameras)
  const [selectedCameraId, setSelectedCameraId] = useState<number | ''>('')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [startTime, setStartTime] = useState('00:00')
  const [endTime, setEndTime] = useState('23:59')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)

  const cameraOptions = cameras.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.location})`,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Playback
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View recorded footage from cameras
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Playback Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Video Player */}
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Playback Controls */}
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

              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
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

                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={4}>4x</option>
                  </select>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Speed: {playbackSpeed}x
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Playback Settings
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Camera Selection */}
              <Select
                label="Camera"
                options={cameraOptions}
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value ? Number(e.target.value) : '')}
              />

              {/* Date Selection */}
              <Input
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              {/* Time Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Time Range
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button className="w-full">Load Playback</Button>
                <Button variant="secondary" className="w-full">
                  Download
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Playback
