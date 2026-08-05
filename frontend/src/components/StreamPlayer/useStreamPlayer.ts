/**
 * useStreamPlayer - React Hook for StreamPlayer
 * 플레이어 생명주기 및 상태 관리
 */

import { useEffect, useRef, useState, useCallback } from 'react'
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

/**
 * useStreamPlayer Hook 반환 타입
 */
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

/**
 * 스트림 프로토콜 자동 감지
 */
function detectProtocol(url: string): 'hls' | 'webrtc' | 'rtsp' | 'unknown' {
  if (url.includes('.m3u8')) return 'hls'
  if (url.includes('ws://') || url.includes('wss://')) return 'webrtc'
  if (url.includes('rtsp://')) return 'rtsp'
  if (url.includes('http://') || url.includes('https://')) return 'hls'
  return 'unknown'
}

/**
 * StreamPlayer를 관리하는 React Hook
 */
export function useStreamPlayer(
  containerRef: React.RefObject<HTMLDivElement>,
  source: StreamSource,
  config?: Partial<PlayerConfig>
): UseStreamPlayerReturn {
  const playerRef = useRef<StreamPlayer | null>(null)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)

  const [state, setState] = useState<PlayerState>('idle')
  const [stats, setStats] = useState<PlayerStats>({
    currentTime: 0,
    duration: 0,
    buffered: { start: 0, end: 0 },
    volume: 1,
    muted: false,
    playbackRate: 1,
  })
  const [error, setError] = useState<PlayerError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [qualityLevels, setQualityLevels] = useState<HLSQuality[]>([])
  const [currentQuality, setCurrentQuality] = useState<HLSQuality | null>(null)

  const protocol = source.protocol || detectProtocol(source.url)

  /**
   * 플레이어 생성 및 초기화
   */
  const initializePlayer = useCallback(async () => {
    if (!containerRef.current) return

    try {
      // 기존 플레이어 정리
      if (playerRef.current) {
        if (playerRef.current instanceof WebRTCPlayer) {
          await (playerRef.current as WebRTCPlayer).destroy()
        } else {
          playerRef.current.destroy()
        }
        playerRef.current = null
      }

      // 프로토콜별 플레이어 생성
      switch (protocol) {
        case 'hls': {
          if (!videoElementRef.current) {
            videoElementRef.current = document.createElement('video')
            videoElementRef.current.style.width = '100%'
            videoElementRef.current.style.height = '100%'
            videoElementRef.current.style.objectFit = 'contain'
            videoElementRef.current.controls = true
            containerRef.current.appendChild(videoElementRef.current)
          }

          playerRef.current = new HLSPlayer(
            videoElementRef.current,
            source.url,
            config?.reconnect
          )
          break
        }

        case 'webrtc': {
          if (!videoElementRef.current) {
            videoElementRef.current = document.createElement('video')
            videoElementRef.current.style.width = '100%'
            videoElementRef.current.style.height = '100%'
            videoElementRef.current.style.objectFit = 'contain'
            videoElementRef.current.autoplay = true
            videoElementRef.current.playsinline = true
            containerRef.current.appendChild(videoElementRef.current)
          }

          playerRef.current = new WebRTCPlayer(
            videoElementRef.current,
            source.url,
            config?.webrtc,
            config?.reconnect
          )
          break
        }

        case 'rtsp': {
          if (!canvasElementRef.current) {
            canvasElementRef.current = document.createElement('canvas')
            canvasElementRef.current.style.width = '100%'
            canvasElementRef.current.style.height = '100%'
            containerRef.current.appendChild(canvasElementRef.current)
          }

          playerRef.current = new RTSPPlayer(
            canvasElementRef.current,
            source.url,
            config?.reconnect
          )
          break
        }

        default:
          throw new Error(`Unsupported protocol: ${protocol}`)
      }

      // 플레이어 이벤트 등록
      setupPlayerListeners()
      setError(null)
    } catch (err) {
      const playerError = {
        type: 'UNKNOWN_ERROR' as const,
        message: err instanceof Error ? err.message : 'Failed to initialize player',
        original: err instanceof Error ? err : undefined,
      }
      setError(playerError)
      console.error('Player initialization error:', err)
    }
  }, [protocol, source.url, config, containerRef])

  /**
   * 플레이어 이벤트 리스너 설정
   */
  const setupPlayerListeners = useCallback(() => {
    if (!playerRef.current) return

    const player = playerRef.current

    // 상태 변경
    player.on('loadstart', () => setIsLoading(true))
    player.on('loadend', () => setIsLoading(false))
    player.on('timeupdate', (data) => {
      setState(data.state || player.getState())
      setStats(player.getStats())
    })
    player.on('buffering', () => setIsLoading(true))
    player.on('buffered', () => setIsLoading(false))

    // 에러 처리
    player.on('error', (error) => {
      setError(error)
      console.error('Player error:', error)
    })

    // HLS 품질 변경
    if (playerRef.current instanceof HLSPlayer) {
      const hlsPlayer = playerRef.current as HLSPlayer
      player.on('durationchange', (data) => {
        if (data.qualityLevels) {
          setQualityLevels(data.qualityLevels)
        }
      })
      player.on('qualitychange', (quality) => {
        setCurrentQuality(quality)
      })
    }

    // 통계 업데이트
    const statsInterval = setInterval(() => {
      setStats(player.getStats())
    }, 1000)

    return () => clearInterval(statsInterval)
  }, [])

  /**
   * 초기화
   */
  useEffect(() => {
    initializePlayer()

    return () => {
      if (playerRef.current) {
        if (playerRef.current instanceof WebRTCPlayer) {
          (playerRef.current as WebRTCPlayer).destroy()
        } else {
          playerRef.current.destroy()
        }
      }
    }
  }, [initializePlayer])

  /**
   * 플레이어 메서드 래핑
   */
  const play = useCallback(async () => {
    if (!playerRef.current) throw new Error('Player not initialized')
    await playerRef.current.play()
  }, [])

  const pause = useCallback(() => {
    if (!playerRef.current) return
    playerRef.current.pause()
  }, [])

  const seek = useCallback((time: number) => {
    if (!playerRef.current) return
    playerRef.current.seek(time)
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
      const hlsPlayer = playerRef.current as HLSPlayer
      hlsPlayer.setQuality(levelIndex)
    }
  }, [])

  const getWebRTCStats = useCallback(async () => {
    if (playerRef.current instanceof WebRTCPlayer) {
      return await (playerRef.current as WebRTCPlayer).getWebRTCStats()
    }
    return {}
  }, [])

  const on = useCallback((event: PlayerEventType, callback: (data?: any) => void) => {
    if (!playerRef.current) return
    playerRef.current.on(event, callback)
  }, [])

  const off = useCallback((event: PlayerEventType, callback: (data?: any) => void) => {
    if (!playerRef.current) return
    playerRef.current.off(event, callback)
  }, [])

  return {
    state,
    stats,
    error,
    player: playerRef.current,
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
