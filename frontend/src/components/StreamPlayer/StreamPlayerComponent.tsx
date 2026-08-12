import React, { useEffect, useRef, useState } from 'react'
import type { StreamPlayerProps, HLSQuality } from '@/types/streamPlayer'
import { useStreamPlayer } from './useStreamPlayer'

const PlayerControls: React.FC<{
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playbackRate: number
  qualityLevels: HLSQuality[]
  currentQuality: HLSQuality | null
  onPlay: () => Promise<void>
  onPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onMutedChange: (muted: boolean) => void
  onPlaybackRateChange: (rate: number) => void
  onQualityChange: (levelIndex: number) => void
  showQualitySelector: boolean
  showCaptions: boolean
}> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  playbackRate,
  qualityLevels,
  currentQuality,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMutedChange,
  onPlaybackRateChange,
  onQualityChange,
  showQualitySelector,
  showCaptions,
}) => {
  const [showSettings, setShowSettings] = useState(false)

  const handlePlayPause = async () => {
    if (isPlaying) {
      onPause()
      return
    }

    try {
      await onPlay()
    } catch (error) {
      console.error('Error playing video:', error)
    }
  }

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    onSeek(percent * duration)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
      <div
        className="w-full h-1 bg-gray-600 rounded cursor-pointer hover:h-2 transition-all mb-3"
        onClick={handleProgressClick}
        role="slider"
        aria-label="Seek"
      >
        <div className="h-full bg-red-500 rounded" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="hover:bg-white/20 rounded p-2 transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onMutedChange(!muted)}
              className="hover:bg-white/20 rounded p-2 transition"
              aria-label="Mute"
            >
              {muted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4L6.46 8H4v8h2.46L12 20v-4.46M3 3l2.58 2.58M3 3l18 18m-3.58-3.58L21 21M12 6L9.41 8.59" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={(event) => onVolumeChange(parseFloat(event.target.value))}
              className="w-16 cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <span className="text-sm ml-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={playbackRate}
            onChange={(event) => onPlaybackRateChange(parseFloat(event.target.value))}
            className="bg-black/50 text-white text-sm px-2 py-1 rounded hover:bg-black/70"
            aria-label="Playback speed"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>

          {showQualitySelector && qualityLevels.length > 0 && (
            <select
              value={qualityLevels.findIndex((quality) => currentQuality?.level === quality.level)}
              onChange={(event) => onQualityChange(parseInt(event.target.value))}
              className="bg-black/50 text-white text-sm px-2 py-1 rounded hover:bg-black/70"
              aria-label="Video quality"
            >
              <option value="-1">Auto</option>
              {qualityLevels.map((quality) => (
                <option key={quality.level} value={quality.level}>
                  {quality.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="hover:bg-white/20 rounded p-2 transition"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l1.72-1.35c.15-.12.19-.34.1-.51l-1.63-2.83c-.12-.22-.37-.29-.59-.22l-2.03.81c-.42-.32-.9-.6-1.44-.79l-.31-2.15c-.05-.24-.24-.41-.5-.41h-3.26c-.26 0-.45.17-.49.41l-.31 2.15c-.54.19-1.02.47-1.44.79l-2.03-.81c-.22-.09-.47 0-.59.22L2.74 8.87c-.09.17-.05.39.1.51l1.72 1.35c-.05.3-.07.62-.07.94 0 .33.02.64.07.94l-1.72 1.35c-.15.12-.19.34-.1.51l1.63 2.83c.12.22.37.29.59.22l2.03-.81c.42.32.9.6 1.44.79l.31 2.15c.05.24.24.41.5.41h3.26c.26 0 .45-.17.49-.41l.31-2.15c.54-.19 1.02-.47 1.44-.79l2.03.81c.22.09.47 0 .59-.22l1.63-2.83c.09-.17.05-.39-.1-.51l-1.72-1.35zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>

          {showSettings && (
            <div className="absolute bottom-16 right-0 bg-black/90 rounded p-2 text-white text-sm min-w-32">
              {showCaptions && (
                <div className="px-3 py-2 hover:bg-white/20 rounded cursor-pointer">
                  Captions
                </div>
              )}
              <div className="px-3 py-2 hover:bg-white/20 rounded cursor-pointer">
                Stats for Nerds
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="flex items-center justify-center h-full bg-black/80 text-white">
    <div className="text-center">
      <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="font-semibold mb-2">Playback error</p>
      <p className="text-sm text-gray-400">{error}</p>
    </div>
  </div>
)

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin">
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" opacity="0.25" />
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>
)

export const StreamPlayerComponent: React.FC<StreamPlayerProps> = ({
  source,
  autoplay = false,
  controls = true,
  muted: _initialMuted = false,
  loop: _loop = false,
  width = '100%',
  height = '100%',
  poster,
  className = '',
  onStateChange,
  onError,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onBuffering,
  onQualityChange: onQualityChangeCallback,
  showQualitySelector = true,
  showCaptions = false,
  captions: _captions = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const latestStatsRef = useRef({ currentTime: 0, duration: 0 })
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    state,
    stats,
    error,
    isLoading,
    qualityLevels,
    currentQuality,
    play,
    pause,
    seek,
    setVolume,
    setMuted,
    setPlaybackRate,
    setQuality,
    on,
    off,
  } = useStreamPlayer(containerRef, source, {
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
    },
  })

  useEffect(() => {
    latestStatsRef.current = {
      currentTime: stats.currentTime,
      duration: stats.duration,
    }
  }, [stats.currentTime, stats.duration])

  useEffect(() => {
    if (onStateChange) {
      onStateChange(state)
    }
  }, [state, onStateChange])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!onTimeUpdate) return
      const { currentTime, duration } = latestStatsRef.current
      onTimeUpdate(currentTime, duration)
    }

    if (onPlay) on('play', onPlay)
    if (onPause) on('pause', onPause)
    if (onEnded) on('ended', onEnded)
    if (onTimeUpdate) on('timeupdate', handleTimeUpdate)
    if (onBuffering) on('buffering', onBuffering)
    if (onQualityChangeCallback) on('qualitychange', onQualityChangeCallback)

    return () => {
      if (onPlay) off('play', onPlay)
      if (onPause) off('pause', onPause)
      if (onEnded) off('ended', onEnded)
      if (onTimeUpdate) off('timeupdate', handleTimeUpdate)
      if (onBuffering) off('buffering', onBuffering)
      if (onQualityChangeCallback) off('qualitychange', onQualityChangeCallback)
    }
  }, [on, off, onPlay, onPause, onEnded, onTimeUpdate, onBuffering, onQualityChangeCallback])

  useEffect(() => {
    if (autoplay && state === 'idle') {
      play().catch(console.error)
    }
  }, [autoplay, state, play])

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        if (state === 'playing') setShowControls(false)
      }, 3000)
    }

    if (containerRef.current && state === 'playing') {
      containerRef.current.addEventListener('mousemove', handleMouseMove)
      return () => {
        containerRef.current?.removeEventListener('mousemove', handleMouseMove)
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
          controlsTimeoutRef.current = null
        }
      }
    }

    return undefined
  }, [state])

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {error && <ErrorDisplay error={error.message} />}

      {isLoading && !error && <LoadingSpinner />}

      {controls && !error && showControls && state !== 'idle' && (
        <PlayerControls
          isPlaying={state === 'playing'}
          currentTime={stats.currentTime}
          duration={stats.duration}
          volume={stats.volume}
          muted={stats.muted}
          playbackRate={stats.playbackRate}
          qualityLevels={qualityLevels}
          currentQuality={currentQuality}
          onPlay={play}
          onPause={pause}
          onSeek={seek}
          onVolumeChange={setVolume}
          onMutedChange={setMuted}
          onPlaybackRateChange={setPlaybackRate}
          onQualityChange={setQuality}
          showQualitySelector={showQualitySelector}
          showCaptions={showCaptions}
        />
      )}

      {state === 'idle' && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer group"
          onClick={() => play().catch(console.error)}
          style={{ backgroundImage: poster ? `url(${poster})` : undefined, backgroundSize: 'cover' }}
        >
          <button className="bg-white/30 hover:bg-white/50 rounded-full p-4 transition group-hover:scale-110">
            <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default StreamPlayerComponent
