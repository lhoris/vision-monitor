/**
 * WebRTCPlayer - WebRTC 기반 저지연 스트림 플레이어
 * WHEP (WebRTC-HTTP Egress Protocol) 클라이언트 구현
 */

import type {
  PlayerError,
  PlayerStats,
  ReconnectConfig,
  WebRTCConfig,
} from '@/types/streamPlayer'
import { StreamPlayer } from './StreamPlayer'

/**
 * WHEP 클라이언트 구현
 */
class WHEPClient {
  private peerConnection: RTCPeerConnection | null = null
  private whepUrl: string
  private resourceUrl: string | null = null
  private iceServers: RTCIceServer[]

  constructor(whepUrl: string, iceServers: RTCIceServer[] = []) {
    this.whepUrl = whepUrl
    this.iceServers = iceServers
  }

  /**
   * WHEP 세션 시작
   */
  async connect(): Promise<RTCPeerConnection> {
    const iceServersConfig = this.iceServers.length > 0
      ? this.iceServers
      : [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] },
        ]

    this.peerConnection = new RTCPeerConnection({
      iceServers: iceServersConfig,
    })

    // ICE 후보자 수집
    const iceCandidates: RTCIceCandidate[] = []
    this.peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate)
      }
    })

    // Offer 생성
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })

    await this.peerConnection.setLocalDescription(offer)

    // 모든 ICE 후보자 수집 대기
    await this.waitForIceCandidates()

    // WHEP POST 요청으로 Answer 획득
    const response = await fetch(this.whepUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
      },
      body: this.peerConnection.localDescription!.sdp,
    })

    if (!response.ok) {
      throw new Error(`WHEP error: ${response.statusText}`)
    }

    this.resourceUrl = response.headers.get('location')
    const answerSdp = await response.text()

    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: answerSdp,
    })

    await this.peerConnection.setRemoteDescription(answer)

    return this.peerConnection
  }

  /**
   * ICE 후보자 수집 대기
   */
  private waitForIceCandidates(): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve()
      }, 1000)

      this.peerConnection?.addEventListener(
        'icegatheringstatechange',
        () => {
          if (this.peerConnection?.iceGatheringState === 'complete') {
            clearTimeout(timeout)
            resolve()
          }
        },
        { once: true }
      )
    })
  }

  /**
   * 연결 종료
   */
  async disconnect(): Promise<void> {
    if (this.resourceUrl) {
      try {
        await fetch(this.resourceUrl, { method: 'DELETE' })
      } catch (error) {
        console.error('Failed to delete WHEP resource:', error)
      }
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
  }
}

/**
 * WebRTC 플레이어 구현 클래스
 */
export class WebRTCPlayer extends StreamPlayer {
  private videoElement: HTMLVideoElement | null = null
  private peerConnection: RTCPeerConnection | null = null
  private whepClient: WHEPClient | null = null
  private webrtcConfig: WebRTCConfig

  constructor(
    videoElement: HTMLVideoElement,
    url: string,
    webrtcConfig?: WebRTCConfig,
    reconnectConfig?: ReconnectConfig
  ) {
    super(url, reconnectConfig)
    this.videoElement = videoElement
    this.webrtcConfig = webrtcConfig || {}
    this.setupVideoElement()
  }

  /**
   * 비디오 요소 설정
   */
  private setupVideoElement(): void {
    if (!this.videoElement) return

    this.videoElement.addEventListener('play', () => this.setState('playing'))
    this.videoElement.addEventListener('pause', () => this.setState('paused'))
    this.videoElement.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.videoElement!.currentTime,
        duration: this.videoElement!.duration,
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
   * WebRTC 연결 설정
   */
  private async setupWebRTC(): Promise<void> {
    try {
      const whepUrl = this.webrtcConfig.whepUrl || this.url
      this.whepClient = new WHEPClient(whepUrl, this.webrtcConfig.iceServers)

      this.peerConnection = await this.whepClient.connect()

      // 원격 스트림 받기
      this.peerConnection.addEventListener('track', (event) => {
        if (this.videoElement && event.streams.length > 0) {
          this.videoElement.srcObject = event.streams[0]
        }
      })

      // 연결 상태 모니터링
      this.peerConnection.addEventListener('connectionstatechange', () => {
        switch (this.peerConnection?.connectionState) {
          case 'connected':
            this.emit('reconnected', {})
            break
          case 'disconnected':
            this.emit('reconnecting', { attempt: 1, delay: 1000 })
            break
          case 'failed':
            this.handleError({
              type: 'NETWORK_ERROR',
              message: 'WebRTC connection failed',
            })
            break
          case 'closed':
            this.setState('idle')
            break
        }
      })

      this.setState('loading')
      this.emit('loadend', {})
    } catch (error) {
      this.handleError({
        type: 'NETWORK_ERROR',
        message: 'Failed to establish WebRTC connection',
        original: error as Error,
      })
      throw error
    }
  }

  /**
   * 재생
   */
  async play(): Promise<void> {
    if (!this.videoElement) {
      throw new Error('Video element not initialized')
    }

    try {
      if (!this.peerConnection) {
        await this.setupWebRTC()
      }

      this.setState('loading')
      this.emit('loadstart', {})
      await this.videoElement.play()
      this.cancelReconnect()
    } catch (error) {
      this.handleError({
        type: 'ABORT_ERROR',
        message: 'Failed to play WebRTC stream',
        original: error as Error,
      })
      throw error
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
   * 시간 이동 (WebRTC는 라이브 스트림이므로 제한됨)
   */
  seek(time: number): void {
    // 라이브 스트림이므로 시간 이동 불가능
    console.warn('Seeking is not supported for WebRTC live streams')
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
   * 재생 속도 설정 (라이브 스트림이므로 제한됨)
   */
  setPlaybackRate(rate: number): void {
    // 라이브 스트림이므로 속도 조절 불가능
    console.warn('Playback rate adjustment is not supported for WebRTC live streams')
  }

  /**
   * 통계 정보
   */
  getStats(): PlayerStats {
    if (!this.videoElement || !this.peerConnection) {
      return {
        currentTime: 0,
        duration: 0,
        buffered: { start: 0, end: 0 },
        volume: 0,
        muted: false,
        playbackRate: 1,
      }
    }

    return {
      currentTime: this.videoElement.currentTime,
      duration: this.videoElement.duration || 0,
      buffered: { start: 0, end: 0 },
      volume: this.videoElement.volume,
      muted: this.videoElement.muted,
      playbackRate: 1,
    }
  }

  /**
   * WebRTC 통계 (고급)
   */
  async getWebRTCStats(): Promise<Record<string, any>> {
    if (!this.peerConnection) {
      return {}
    }

    const stats: Record<string, any> = {}
    const report = await this.peerConnection.getStats()

    report.forEach((stat) => {
      if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
        stats.video = {
          bytesReceived: stat.bytesReceived,
          packetsReceived: stat.packetsReceived,
          packetsLost: stat.packetsLost,
          jitter: stat.jitter,
          frameWidth: stat.frameWidth,
          frameHeight: stat.frameHeight,
          framesDecoded: stat.framesDecoded,
          framesDropped: stat.framesDropped,
          frameRate: stat.framesPerSecond,
        }
      }
      if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
        stats.connection = {
          currentRoundTripTime: stat.currentRoundTripTime,
          availableOutgoingBitrate: stat.availableOutgoingBitrate,
          availableIncomingBitrate: stat.availableIncomingBitrate,
        }
      }
    })

    return stats
  }

  /**
   * 리소스 해제
   */
  async destroy(): Promise<void> {
    this.cancelReconnect()

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }

    if (this.whepClient) {
      await this.whepClient.disconnect()
      this.whepClient = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.videoElement = null
    this.listeners.clear()
  }
}
