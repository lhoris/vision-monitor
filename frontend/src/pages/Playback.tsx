/**
 * Playback Page
 * 녹화 영상 재생 및 시간 선택 UI
 */

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Input, Select } from '@/components/Common'
import { useAppSelector } from '@/store'
import { useCameraPlayback } from '@/hooks/useCameraPlayback'
import { StreamPlayer as StreamPlayerComponent } from '@/components/StreamPlayer'

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
  const [playbackRequested, setPlaybackRequested] = useState(false)

  const { playbackSession, playbackLoading, playbackError } = useCameraPlayback({
    cameraId: selectedCameraId === '' ? null : selectedCameraId,
    enabled: playbackRequested,
  })

  const cameraOptions = cameras.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.location})`,
  }))

  return (
    <div className="flex min-h-full flex-col gap-4 p-4 lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-6">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
          Playback
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View recorded footage from cameras
        </p>
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:flex-1 lg:grid-cols-4 lg:gap-6 lg:overflow-hidden">
        {/* Main Playback Area */}
        <div className="min-h-0 lg:col-span-3 lg:flex lg:min-h-0 lg:flex-col">
          {/* Video Player */}
          <Card className="lg:flex lg:h-full lg:min-h-0 lg:flex-col">
              <div className="flex aspect-video w-full shrink-0 items-center justify-center bg-black lg:h-[min(56vh,36rem)] lg:aspect-auto">
                {playbackLoading ? (
                  <span className="text-sm text-gray-300">Loading recording...</span>
                ) : playbackSession ? (
                  <StreamPlayerComponent
                    source={{
                      url: playbackSession.playbackUrl,
                      protocol: playbackSession.playbackProtocol === 'hls' ? 'hls' : 'unknown',
                      label: `Camera ${playbackSession.cameraId} recording`,
                    }}
                    autoplay
                    muted={false}
                    controls
                    className="h-full w-full"
                    onTimeUpdate={(time) => setCurrentTime(time)}
                  />
                ) : (
                  <div className="text-center text-sm text-gray-400">
                    {playbackError ? 'Recording is unavailable for this range.' : 'Select a camera and load playback.'}
                  </div>
                )}
              </div>

            {/* Playback Controls */}
            <CardBody className="shrink-0 space-y-3 p-4 lg:space-y-2">
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
                <Button
                  className="w-full"
                  disabled={selectedCameraId === ''}
                  onClick={() => {
                    setCurrentTime(0)
                    setPlaybackRequested(false)
                    window.setTimeout(() => setPlaybackRequested(true), 0)
                  }}
                >
                  Load Playback
                </Button>
                <Button variant="secondary" className="w-full" disabled={!playbackSession}>
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
