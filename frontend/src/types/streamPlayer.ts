/**
 * StreamPlayer Type Definitions
 * 다양한 스트리밍 프로토콜을 지원하는 플레이어의 타입 정의
 */

/**
 * 스트리밍 프로토콜 타입
 */
export type StreamProtocol = 'hls' | 'webrtc' | 'rtsp' | 'unknown'

/**
 * 스트림 소스 정보
 */
export interface StreamSource {
  url: string
  protocol: StreamProtocol
  label?: string
  backup?: string // 백업 URL
}

/**
 * 플레이어 상태
 */
export enum PlayerState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error',
  SEEKING = 'seeking',
}

/**
 * 플레이어 이벤트 타입
 */
export type PlayerEventType =
  | 'play'
  | 'pause'
  | 'seek'
  | 'ended'
  | 'error'
  | 'loadstart'
  | 'loadend'
  | 'volumechange'
  | 'timeupdate'
  | 'durationchange'
  | 'qualitychange'
  | 'buffering'
  | 'buffered'
  | 'reconnecting'
  | 'reconnected'

/**
 * 플레이어 이벤트 데이터
 */
export interface PlayerEvent {
  type: PlayerEventType
  timestamp: number
  data?: Record<string, any>
}

/**
 * 플레이어 에러 타입
 */
export enum PlayerErrorType {
  NETWORK = 'NETWORK_ERROR',
  DECODE = 'DECODE_ERROR',
  ABORT = 'ABORT_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  NOT_SUPPORTED = 'NOT_SUPPORTED_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * 플레이어 에러 정보
 */
export interface PlayerError {
  type: PlayerErrorType
  message: string
  code?: number
  original?: Error
}

/**
 * 플레이어 통계 정보
 */
export interface PlayerStats {
  currentTime: number
  duration: number
  buffered: TimeRanges | { start: number; end: number }[]
  volume: number
  muted: boolean
  playbackRate: number
  width?: number
  height?: number
  bitrate?: number
  fps?: number
  droppedFrames?: number
}

/**
 * HLS 품질 정보
 */
export interface HLSQuality {
  level: number
  width: number
  height: number
  bitrate: number
  name: string
}

/**
 * 플레이어 콘텍스트 (React Context)
 */
export interface PlayerContextType {
  state: PlayerState
  stats: PlayerStats
  error: PlayerError | null
  isFullscreen: boolean
  isLoading: boolean
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setPlaybackRate: (rate: number) => void
  toggleFullscreen: () => void
  on: (event: PlayerEventType, callback: (data?: any) => void) => void
  off: (event: PlayerEventType, callback: (data?: any) => void) => void
}

/**
 * StreamPlayerComponent Props
 */
export interface StreamPlayerProps {
  source: StreamSource
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  loop?: boolean
  width?: string | number
  height?: string | number
  poster?: string
  className?: string
  onStateChange?: (state: PlayerState) => void
  onError?: (error: PlayerError) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onBuffering?: (buffered: number) => void
  onQualityChange?: (quality: HLSQuality) => void
  showQualitySelector?: boolean
  showCaptions?: boolean
  captions?: CaptionTrack[]
}

/**
 * 자막 정보
 */
export interface CaptionTrack {
  kind: 'captions' | 'subtitles' | 'descriptions'
  src: string
  srclang: string
  label: string
  default?: boolean
}

/**
 * WebRTC 설정
 */
export interface WebRTCConfig {
  iceServers?: RTCIceServer[]
  enableDataChannel?: boolean
  offerOptions?: RTCOfferOptions
  answerOptions?: RTCAnswerOptions
  whepUrl?: string
}

/**
 * 재연결 설정
 */
export interface ReconnectConfig {
  enabled: boolean
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
}

/**
 * 플레이어 설정
 */
export interface PlayerConfig {
  protocol: StreamProtocol
  reconnect?: ReconnectConfig
  webrtc?: WebRTCConfig
  abr?: {
    enabled: boolean
    minBitrate?: number
    maxBitrate?: number
  }
  buffer?: {
    targetDuration?: number
    maxDuration?: number
  }
}
