import type { Camera } from '@/types/camera'
import type { StreamProtocol } from '@/types/streamPlayer'
import { usePageResumeToken } from '@/hooks/usePageResumeToken'
import { isStreamPageUrl } from '@/streaming/config'
import { StreamPlayerComponent } from './StreamPlayerComponent'

interface LiveStreamPlayerProps {
  camera: Camera
  className?: string
}

export function LiveStreamPlayer({ camera, className = '' }: LiveStreamPlayerProps) {
  const resumeToken = usePageResumeToken()

  if (isStreamPageUrl(camera.streamUrl)) {
    return (
      <iframe
        key={`${camera.id}:${camera.streamUrl}:${resumeToken}`}
        src={camera.streamUrl}
        title={`${camera.name} stream`}
        className={`border-0 ${className}`}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <StreamPlayerComponent
      key={`${camera.id}:${camera.streamUrl}:${resumeToken}`}
      source={{
        url: camera.streamUrl,
        protocol: (camera.streamProtocol || 'unknown') as StreamProtocol,
      }}
      controls={true}
      autoplay={false}
      className={className}
    />
  )
}

export default LiveStreamPlayer
