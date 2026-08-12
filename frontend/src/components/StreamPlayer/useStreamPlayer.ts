import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  StreamSource,
  PlayerState,
  PlayerError,
  PlayerEventType,
  PlayerStats,
  PlayerConfig,
  HLSQuality,
} from '@/types/streamPlayer'
import { StreamPlayer } from './StreamPlayer'
import { HLSPlayer } from './HLSPlayer'
import { WebRTCPlayer } from './WebRTCPlayer'
import { RTSPPlayer } from './RTSPPlayer'

const INITIAL_STATS: PlayerStats = {
  currentTime: 0,
  duration: 0,
  buffered: { start: 0, end: 0 },
  volume: 1,
  muted: false,
  playbackRate: 1,
}

export interface UseStreamPlayerReturn {
  state: PlayerState
  stats: PlayerStats
  error: PlayerError | null
  player: StreamPlayer | null
  isLoading: boolean
  qualityLevels: HLSQuality[]
  currentQuality: HLSQuality | null
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setPlaybackRate: (rate: number) => void
  setQuality: (levelIndex: number) => void
  getWebRTCStats: () => Promise<Record<string, any>>
  on: (event: PlayerEventType, callback: (data?: any) => void) => void
  off: (event: PlayerEventType, callback: (data?: any) => void) => void
}

function detectProtocol(url: string): 'hls' | 'webrtc' | 'rtsp' | 'unknown' {
  if (url.includes('.m3u8')) return 'hls'
  if (url.includes('ws://') || url.includes('wss://')) return 'webrtc'
  if (url.includes('rtsp://')) return 'rtsp'

  if (url.includes('http://') || url.includes('https://')) {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    const search = urlObj.search.toLowerCase()

    if (
      pathname.includes('/whep') ||
      pathname.includes('/webrtc') ||
      pathname.includes('/rtp') ||
      pathname.includes('/play') ||
      search.includes('whep') ||
      search.includes('webrtc')
    ) {
      return 'webrtc'
    }

    return 'hls'
  }

  return 'unknown'
}

async function destroyPlayer(player: StreamPlayer): Promise<void> {
  if (player instanceof WebRTCPlayer) {
    await player.destroy()
    return
  }

  player.destroy()
}

export function useStreamPlayer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  source: StreamSource,
  config?: Partial<PlayerConfig>
): UseStreamPlayerReturn {
  const playerRef = useRef<StreamPlayer | null>(null)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lifecycleTokenRef = useRef(0)
  const configRef = useRef<Partial<PlayerConfig> | undefined>(config)

  const [state, setState] = useState<PlayerState>('idle')
  const [playerInstance, setPlayerInstance] = useState<StreamPlayer | null>(null)
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS)
  const [error, setError] = useState<PlayerError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [qualityLevels, setQualityLevels] = useState<HLSQuality[]>([])
  const [currentQuality, setCurrentQuality] = useState<HLSQuality | null>(null)

  const protocol = source.protocol === 'unknown' || !source.protocol
    ? detectProtocol(source.url)
    : source.protocol

  useEffect(() => {
    configRef.current = config
  }, [config])

  const isCurrentLifecycle = useCallback((token: number) => (
    lifecycleTokenRef.current === token
  ), [])

  const clearStatsInterval = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
      statsIntervalRef.current = null
    }
  }, [])

  const removeMediaElements = useCallback(() => {
    videoElementRef.current?.remove()
    canvasElementRef.current?.remove()
    videoElementRef.current = null
    canvasElementRef.current = null
  }, [])

  const setupPlayerListeners = useCallback((player: StreamPlayer, token: number) => {
    clearStatsInterval()

    player.on('loadstart', () => {
      if (isCurrentLifecycle(token)) setIsLoading(true)
    })
    player.on('loadend', () => {
      if (isCurrentLifecycle(token)) setIsLoading(false)
    })
    player.on('timeupdate', (data) => {
      if (!isCurrentLifecycle(token) || playerRef.current !== player) return
      setState(data.state || player.getState())
      setStats(player.getStats())
    })
    player.on('buffering', () => {
      if (isCurrentLifecycle(token)) setIsLoading(true)
    })
    player.on('buffered', () => {
      if (isCurrentLifecycle(token)) setIsLoading(false)
    })
    player.on('error', (playerError) => {
      if (!isCurrentLifecycle(token)) return
      setError(playerError)
      console.error('Player error:', playerError)
    })

    if (player instanceof HLSPlayer) {
      player.on('durationchange', (data) => {
        if (!isCurrentLifecycle(token)) return
        if (data.qualityLevels) {
          setQualityLevels(data.qualityLevels)
        }
      })
      player.on('qualitychange', (quality) => {
        if (isCurrentLifecycle(token)) setCurrentQuality(quality)
      })
    }

    statsIntervalRef.current = setInterval(() => {
      if (!isCurrentLifecycle(token) || playerRef.current !== player) return
      setStats(player.getStats())
    }, 1000)
  }, [clearStatsInterval, isCurrentLifecycle])

  const createPlayer = useCallback((): StreamPlayer => {
    if (!containerRef.current) {
      throw new Error('Player container not initialized')
    }

    switch (protocol) {
      case 'hls': {
        videoElementRef.current = document.createElement('video')
        videoElementRef.current.style.width = '100%'
        videoElementRef.current.style.height = '100%'
        videoElementRef.current.style.objectFit = 'contain'
        containerRef.current.appendChild(videoElementRef.current)

        return new HLSPlayer(videoElementRef.current, source.url, configRef.current?.reconnect)
      }

      case 'webrtc': {
        videoElementRef.current = document.createElement('video')
        videoElementRef.current.style.width = '100%'
        videoElementRef.current.style.height = '100%'
        videoElementRef.current.style.objectFit = 'contain'
        videoElementRef.current.autoplay = true
        videoElementRef.current.playsInline = true
        containerRef.current.appendChild(videoElementRef.current)

        return new WebRTCPlayer(
          videoElementRef.current,
          source.url,
          configRef.current?.webrtc,
          configRef.current?.reconnect
        )
      }

      case 'rtsp': {
        canvasElementRef.current = document.createElement('canvas')
        canvasElementRef.current.style.width = '100%'
        canvasElementRef.current.style.height = '100%'
        containerRef.current.appendChild(canvasElementRef.current)

        return new RTSPPlayer(canvasElementRef.current, source.url, configRef.current?.reconnect)
      }

      default:
        throw new Error(`Unsupported protocol: ${protocol}`)
    }
  }, [containerRef, protocol, source.url])

  useEffect(() => {
    const token = lifecycleTokenRef.current + 1
    lifecycleTokenRef.current = token

    setState('idle')
    setStats(INITIAL_STATS)
    setError(null)
    setIsLoading(false)
    setQualityLevels([])
    setCurrentQuality(null)

    const initializePlayer = async () => {
      if (!containerRef.current) return

      const previousPlayer = playerRef.current
      playerRef.current = null
      setPlayerInstance(null)
      clearStatsInterval()
      removeMediaElements()

      if (previousPlayer) {
        await destroyPlayer(previousPlayer)
      }

      if (!isCurrentLifecycle(token)) return

      try {
        const nextPlayer = createPlayer()
        if (!isCurrentLifecycle(token)) {
          await destroyPlayer(nextPlayer)
          return
        }

        playerRef.current = nextPlayer
        setupPlayerListeners(nextPlayer, token)
        setPlayerInstance(nextPlayer)
      } catch (err) {
        if (!isCurrentLifecycle(token)) return
        const playerError = {
          type: 'UNKNOWN_ERROR' as const,
          message: err instanceof Error ? err.message : 'Failed to initialize player',
          original: err instanceof Error ? err : undefined,
        }
        setError(playerError)
        console.error('Player initialization error:', err)
      }
    }

    void initializePlayer()

    return () => {
      lifecycleTokenRef.current += 1
      const player = playerRef.current
      playerRef.current = null
      setPlayerInstance(null)
      clearStatsInterval()
      removeMediaElements()

      if (player) {
        void destroyPlayer(player).catch((err) => {
          console.error('Failed to destroy player:', err)
        })
      }
    }
  }, [
    clearStatsInterval,
    containerRef,
    createPlayer,
    isCurrentLifecycle,
    removeMediaElements,
    setupPlayerListeners,
    source.url,
  ])

  const play = useCallback(async () => {
    if (!playerRef.current) throw new Error('Player not initialized')
    await playerRef.current.play()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pause()
  }, [])

  const seek = useCallback((time: number) => {
    playerRef.current?.seek(time)
  }, [])

  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current) return
    playerRef.current.setVolume(volume)
    setStats((prev) => ({ ...prev, volume }))
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    if (!playerRef.current) return
    playerRef.current.setMuted(muted)
    setStats((prev) => ({ ...prev, muted }))
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    if (!playerRef.current) return
    playerRef.current.setPlaybackRate(rate)
    setStats((prev) => ({ ...prev, playbackRate: rate }))
  }, [])

  const setQuality = useCallback((levelIndex: number) => {
    if (playerRef.current instanceof HLSPlayer) {
      playerRef.current.setQuality(levelIndex)
    }
  }, [])

  const getWebRTCStats = useCallback(async () => {
    if (playerRef.current instanceof WebRTCPlayer) {
      return await playerRef.current.getWebRTCStats()
    }
    return {}
  }, [])

  const on = useCallback((event: PlayerEventType, callback: (data?: any) => void) => {
    playerRef.current?.on(event, callback)
  }, [])

  const off = useCallback((event: PlayerEventType, callback: (data?: any) => void) => {
    playerRef.current?.off(event, callback)
  }, [])

  return {
    state,
    stats,
    error,
    player: playerInstance,
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
    getWebRTCStats,
    on,
    off,
  }
}
