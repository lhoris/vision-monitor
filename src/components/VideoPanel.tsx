import { EmptyVideo } from './EmptyVideo';

interface VideoPanelProps {
  videoUrl?: string;
}

export function VideoPanel({ videoUrl }: VideoPanelProps) {
  if (!videoUrl) {
    return <EmptyVideo />;
  }

  return (
    <video
      src={videoUrl}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        borderRadius: '4px',
        objectFit: 'cover',
      }}
      controls
      playsInline
    />
  );
}
