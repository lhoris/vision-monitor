/**
 * Stream Player Component
 * 다양한 스트리밍 프로토콜을 지원하는 비디오 플레이어
 */

export { StreamPlayerComponent as StreamPlayer } from './StreamPlayerComponent'
export { useStreamPlayer } from './useStreamPlayer'
export { StreamPlayer as StreamPlayerBase } from './StreamPlayer'
export { HLSPlayer } from './HLSPlayer'
export { WebRTCPlayer } from './WebRTCPlayer'
export { RTSPPlayer } from './RTSPPlayer'

// 타입 재내보내기
export type {
  StreamPlayerProps,
  StreamSource,
  PlayerState,
  PlayerEvent,
  PlayerEventType,
  PlayerError,
  PlayerStats,
  PlayerErrorType,
  HLSQuality,
  PlayerConfig,
  ReconnectConfig,
  WebRTCConfig,
  CaptionTrack,
  PlayerContextType,
} from '@/types/streamPlayer'

export type { UseStreamPlayerReturn } from './useStreamPlayer'
