/**
 * HLSPlayer - HLS/m3u8 스트림 플레이어 구현
 * Video.js 및 hls.js 기반
 */

import Hls from 'hls.js'
import type {
  PlayerState,
  PlayerError,
  PlayerStats,
  HLSQuality,
  ReconnectConfig,
  PlayerErrorType,
} from '@/types/streamPlayer'
import { StreamPlayer } from './StreamPlayer'

/**
 * HLS 플레이어 구현 클래스
 */
export class HLSPlayer extends StreamPlayer {
  private videoElement: HTMLVideoElement | null = null
  private hlsInstance: Hls | null = null
  private qualityLevels: HLSQuality[] = []
  private currentQualityLevel: number = -1
  private manifestParsed: boolean = false
  private playPending: boolean = false

  constructor(videoElement: HTMLVideoElement, url: string, reconnectConfig?: ReconnectConfig) {
    super(url, reconnectConfig)
    this.videoElement = videoElement
    this.setupVideoElement()
    this.setupHLS()
  }

  /**
   * 비디오 요소 설정
   */
  private setupVideoElement(): void {
    if (!this.videoElement) return

    // 기본 controls 비활성화 (커스텀 PlayerControls 사용)
    this.videoElement.controls = false

    this.videoElement.addEventListener('play', () => this.setState('playing'))
    this.videoElement.addEventListener('pause', () => this.setState('paused'))
    this.videoElement.addEventListener('seeking', () => this.setState('seeking'))
    this.videoElement.addEventListener('seeked', () => {
      if (this.state === 'seeking') {
        this.emit('seek', { currentTime: this.videoElement!.currentTime })
      }
    })
    this.videoElement.addEventListener('ended', () => {
      this.setState('idle')
      this.emit('ended', {})
    })
    this.videoElement.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.videoElement!.currentTime,
        duration: this.videoElement!.duration,
      })
    })
    this.videoElement.addEventListener('durationchange', () => {
      this.emit('durationchange', { duration: this.videoElement!.duration })
    })
    this.videoElement.addEventListener('volumechange', () => {
      this.emit('volumechange', {
        volume: this.videoElement!.volume,
        muted: this.videoElement!.muted,
      })
    })
    this.videoElement.addEventListener('error', (e) => {
      const mediaError = (e.target as HTMLMediaElement).error
      if (mediaError) {
        this.handleError({
          type: 'NETWORK_ERROR',
          message: `Media error: ${mediaError.message}`,
          code: mediaError.code,
        })
      }
    })
  }

  /**
   * HLS 설정
   */
  private setupHLS(): void {
    if (!this.videoElement) return

    if (Hls.isSupported()) {
      this.hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      })

      this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        this.manifestParsed = true
        this.setState('loading')
        this.loadQualityLevels()
        this.emit('loadend', {})

        // 매니페스트 파싱 후 대기 중인 재생 처리
        if (this.playPending) {
          this.playPending = false
          this.performPlay().catch(console.error)
        }
      })

      this.hlsInstance.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
        const quality = this.qualityLevels[data.level]
        if (quality) {
          this.currentQualityLevel = data.level
          this.emit('qualitychange', quality)
        }
      })

      this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        const errorType = data.type as PlayerErrorType
        const message = data.details || 'Unknown HLS error'

        if (data.fatal) {
          let playerError: PlayerError
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            playerError = {
              type: 'NETWORK_ERROR',
              message: `Network error: ${message}`,
              code: data.response?.status,
            }
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            playerError = {
              type: 'DECODE_ERROR',
              message: `Media error: ${message}`,
            }
          } else {
            playerError = {
              type: 'UNKNOWN_ERROR',
              message: message,
            }
          }

          this.handleError(playerError)
        }
      })

      this.hlsInstance.loadSource(this.url)
      if (this.videoElement) {
        this.hlsInstance.attachMedia(this.videoElement)
      }
    } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      this.videoElement.src = this.url
    }
  }

  /**
   * 품질 레벨 로드
   */
  private loadQualityLevels(): void {
    if (!this.hlsInstance || !this.hlsInstance.levels) return

    this.qualityLevels = this.hlsInstance.levels.map((level: any, index: number) => ({
      level: index,
      width: level.width || 0,
      height: level.height || 0,
      bitrate: level.bitrate || 0,
      name: `${level.height}p`,
    }))

    this.emit('durationchange', {
      qualityLevels: this.qualityLevels,
    })
  }

  /**
   * 재생 (매니페스트 파싱 대기)
   */
  async play(): Promise<void> {
    if (!this.videoElement) {
      throw new Error('Video element not initialized')
    }

    // 매니페스트가 파싱되지 않았으면 대기
    if (!this.manifestParsed) {
      this.playPending = true
      return
    }

    return this.performPlay()
  }

  /**
   * 실제 재생 수행
   */
  private async performPlay(): Promise<void> {
    if (!this.videoElement) {
      throw new Error('Video element not initialized')
    }

    try {
      this.setState('loading')
      this.emit('loadstart', {})
      await this.videoElement.play()
      this.cancelReconnect()
    } catch (error) {
      // ABORT_ERROR는 무시 (새로운 로드 요청으로 인한 중단)
      const err = error as any
      if (err?.name !== 'AbortError') {
        this.handleError({
          type: 'ABORT_ERROR',
          message: 'Failed to play video',
          original: error as Error,
        })
      }
    }
  }

  /**
   * 일시정지
   */
  pause(): void {
    if (!this.videoElement) return
    this.videoElement.pause()
    this.setState('paused')
    this.emit('pause', {})
  }

  /**
   * 시간 이동
   */
  seek(time: number): void {
    if (!this.videoElement) return
    this.videoElement.currentTime = Math.max(0, Math.min(time, this.videoElement.duration))
  }

  /**
   * 볼륨 설정
   */
  setVolume(volume: number): void {
    if (!this.videoElement) return
    this.videoElement.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 음소거 설정
   */
  setMuted(muted: boolean): void {
    if (!this.videoElement) return
    this.videoElement.muted = muted
  }

  /**
   * 재생 속도 설정
   */
  setPlaybackRate(rate: number): void {
    if (!this.videoElement) return
    this.videoElement.playbackRate = Math.max(0.25, Math.min(2, rate))
  }

  /**
   * 품질 변경
   */
  setQuality(levelIndex: number): void {
    if (!this.hlsInstance || levelIndex < 0 || levelIndex >= this.qualityLevels.length) {
      return
    }
    this.hlsInstance.currentLevel = levelIndex
  }

  /**
   * 자동 품질 조절 설정
   */
  setAutoQuality(enabled: boolean): void {
    if (!this.hlsInstance) return
    if (enabled) {
      this.hlsInstance.currentLevel = -1
    }
  }

  /**
   * 사용 가능한 품질 조회
   */
  getQualityLevels(): HLSQuality[] {
    return this.qualityLevels
  }

  /**
   * 현재 품질 조회
   */
  getCurrentQuality(): HLSQuality | null {
    if (this.currentQualityLevel < 0 || this.currentQualityLevel >= this.qualityLevels.length) {
      return null
    }
    return this.qualityLevels[this.currentQualityLevel]
  }

  /**
   * 통계 정보
   */
  getStats(): PlayerStats {
    if (!this.videoElement) {
      return {
        currentTime: 0,
        duration: 0,
        buffered: { start: 0, end: 0 },
        volume: 0,
        muted: false,
        playbackRate: 1,
      }
    }

    const bufferedRanges: { start: number; end: number }[] = []
    const buffered = this.videoElement.buffered
    for (let i = 0; i < buffered.length; i++) {
      bufferedRanges.push({
        start: buffered.start(i),
        end: buffered.end(i),
      })
    }

    const currentQuality = this.getCurrentQuality()

    return {
      currentTime: this.videoElement.currentTime,
      duration: this.videoElement.duration,
      buffered: bufferedRanges,
      volume: this.videoElement.volume,
      muted: this.videoElement.muted,
      playbackRate: this.videoElement.playbackRate,
      width: currentQuality?.width,
      height: currentQuality?.height,
      bitrate: currentQuality?.bitrate,
    }
  }

  /**
   * 리소스 해제
   */
  destroy(): void {
    this.cancelReconnect()
    this.manifestParsed = false
    this.playPending = false

    if (this.videoElement) {
      this.videoElement.src = ''
    }

    if (this.hlsInstance) {
      this.hlsInstance.destroy()
      this.hlsInstance = null
    }

    this.videoElement = null
    this.listeners.clear()
  }
}
