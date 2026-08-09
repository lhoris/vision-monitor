/**
 * StreamPlayer - Abstract Base Class
 * 다양한 스트리밍 프로토콜을 지원하는 추상 플레이어
 */

import type {
  PlayerState,
  PlayerEventType,
  PlayerError,
  PlayerStats,
  ReconnectConfig,
} from '@/types/streamPlayer'

/**
 * 스트림 플레이어 추상 클래스
 * 모든 플레이어 구현의 기본 인터페이스 제공
 */
export abstract class StreamPlayer {
  protected url: string
  protected state: PlayerState = 'idle'
  protected listeners: Map<PlayerEventType, Set<Function>> = new Map()
  protected reconnectConfig: ReconnectConfig
  protected reconnectAttempts: number = 0
  protected reconnectTimer: NodeJS.Timeout | null = null

  constructor(url: string, reconnectConfig?: ReconnectConfig) {
    this.url = url
    this.reconnectConfig = reconnectConfig || {
      enabled: false,
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
    }
  }

  /**
   * 스트림 재생
   */
  abstract play(): Promise<void>

  /**
   * 스트림 일시정지
   */
  abstract pause(): void

  /**
   * 특정 시간으로 이동
   */
  abstract seek(time: number): void

  /**
   * 볼륨 설정
   */
  abstract setVolume(volume: number): void

  /**
   * 음소거 설정
   */
  abstract setMuted(muted: boolean): void

  /**
   * 재생 속도 설정
   */
  abstract setPlaybackRate(rate: number): void

  /**
   * 현재 통계 정보 반환
   */
  abstract getStats(): PlayerStats

  /**
   * 플레이어 정리 및 리소스 해제
   */
  abstract destroy(): void

  /**
   * 이벤트 리스너 등록
   */
  on(event: PlayerEventType, callback: (data?: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event: PlayerEventType, callback: (data?: any) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback)
    }
  }

  /**
   * 이벤트 발생
   */
  protected emit(event: PlayerEventType, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }

  /**
   * 플레이어 상태 변경
   */
  protected setState(state: PlayerState): void {
    if (this.state !== state) {
      this.state = state
      this.emit('timeupdate', { state })
    }
  }

  /**
   * 에러 처리
   */
  protected handleError(error: PlayerError): void {
    console.error('Player error:', error)
    this.setState('error')
    this.emit('error', error)

    if (this.reconnectConfig.enabled) {
      this.attemptReconnect()
    }
  }

  /**
   * 자동 재연결 로직
   */
  protected attemptReconnect(): void {
    if (this.reconnectAttempts >= this.reconnectConfig.maxAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectConfig.initialDelay *
        Math.pow(this.reconnectConfig.backoffFactor, this.reconnectAttempts - 1),
      this.reconnectConfig.maxDelay
    )

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay })

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.reconnectConfig.maxAttempts})`)
      this.play()
        .then(() => {
          this.reconnectAttempts = 0
          this.emit('reconnected', {})
        })
        .catch((error) => {
          this.attemptReconnect()
        })
    }, delay)
  }

  /**
   * 재연결 타이머 취소
   */
  protected cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }

  /**
   * 현재 상태 반환
   */
  getState(): PlayerState {
    return this.state
  }
}
